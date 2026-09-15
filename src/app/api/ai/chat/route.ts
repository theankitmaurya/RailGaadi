import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrainService } from '@/services/train';
import { PlannerService } from '@/services/planner';
import { AnalyticsService } from '@/services/analytics';
import { WeatherService } from '@/services/weather';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, currentTrainNumber, currentContext } = body;

    const userMessage = messages?.[messages.length - 1]?.content || '';
    if (!userMessage.trim()) {
      return NextResponse.json(
        { error: { message: 'Message cannot be empty' } },
        { status: 400 }
      );
    }

    // 1. Gather active railway context if train is active or mentioned
    let liveStatusData = null;
    let weatherData = null;
    const trainNumMatch = userMessage.match(/\b\d{5}\b/) || (currentTrainNumber ? [currentTrainNumber] : null);

    if (trainNumMatch && trainNumMatch[0]) {
      const trainNum = trainNumMatch[0];
      try {
        liveStatusData = await TrainService.getJourneyStatus(trainNum);
        weatherData = await WeatherService.getJourneyWeather(trainNum);
      } catch {
        // Continue
      }
    }

    // 2. Check for journey planning intent (e.g. from X to Y)
    let planData = null;
    const planMatch = userMessage.match(/(?:from|between)\s+([a-zA-Z\s]+?)\s+(?:to|and)\s+([a-zA-Z\s]+)/i);
    if (planMatch) {
      const fromQuery = planMatch[1].trim();
      const toQuery = planMatch[2].trim();
      try {
        // Map common city names to codes
        const codeMap: Record<string, string> = {
          delhi: 'NDLS',
          mumbai: 'MMCT',
          agra: 'AGC',
          lucknow: 'LKO',
          varanasi: 'BSB',
          bhopal: 'BPL',
          howrah: 'HWH',
          kolkata: 'HWH',
          ahmedabad: 'ADI',
          chennai: 'MAS',
          kanpur: 'CNB',
        };
        const fromCode = codeMap[fromQuery.toLowerCase()] || fromQuery.toUpperCase().slice(0, 4);
        const toCode = codeMap[toQuery.toLowerCase()] || toQuery.toUpperCase().slice(0, 4);
        planData = await PlannerService.findTrainsBetween({ from: fromCode, to: toCode, preference: 'reliable' });
      } catch {
        // Continue
      }
    }

    // 3. Query Google Gemini AI
    let replyText = '';
    const insights: Array<{ title: string; detail: string; variant?: 'info' | 'warning' | 'success' }> = [];

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemPrompt = `You are RailGaadi AI, an intelligent, empathetic, and ultra-accurate Indian Railways journey assistant.
Answer the passenger's question concisely using the provided real-time railway data. Do NOT hallucinate train numbers or delays.

Current Context:
${liveStatusData ? `Active Train: ${liveStatusData.train.number} - ${liveStatusData.train.name}
Current Location: ${liveStatusData.currentStation?.station.name || 'En route'} (${liveStatusData.location?.lat}, ${liveStatusData.location?.lng})
Next Halt: ${liveStatusData.nextStation?.station.name || 'Destination'}
Current Delay: ${liveStatusData.delayMinutes} minutes (${liveStatusData.state})
Speed: ${liveStatusData.speedKph || 0} km/h
Distance Covered: ${Math.round(liveStatusData.progress.distanceCoveredKm)} km (${liveStatusData.progress.percentage}% completed)` : 'No single train selected yet.'}

${weatherData ? `Route Weather: Current temp is ${weatherData.current?.temperatureC || 28}°C (${weatherData.current?.condition || 'Clear'}) at ${weatherData.current?.locationName || 'route'}.` : ''}

${planData && planData.length > 0 ? `Available Trains between stations:
${planData.slice(0, 3).map(t => `- ${t.trainNumber} ${t.trainName}: Departs ${t.fromStation.departureTime}, Duration ${t.durationText}, Reliability ${t.reliabilityScore}/100, Delay risk: ${t.delayRisk}`).join('\n')}` : ''}

Instructions:
- Keep the response direct, friendly, and formatted in clean markdown bullet points or bold highlights.
- If asked about delays, explain whether the delay is manageable and how much time remains.
- If asked about weather, mention any rain or high temperatures along the route.
- If asked about best trains, highlight the highest reliability option.`;

      const chatResult = await model.generateContent([
        { text: systemPrompt },
        { text: `Passenger asks: "${userMessage}"` },
      ]);

      replyText = chatResult.response.text();
    } catch (geminiErr: any) {
      console.warn('Gemini API notice, generating grounded fallback response:', geminiErr.message);

      // Intelligent deterministic fallback if Gemini key has temporary rate limit
      if (liveStatusData) {
        replyText = `### 🚆 Train ${liveStatusData.train.number} (${liveStatusData.train.name})\n\n` +
          `* **Current Position**: Near **${liveStatusData.currentStation?.station.name || 'En route'}**\n` +
          `* **Next Station**: **${liveStatusData.nextStation?.station.name || liveStatusData.train.destinationName}**\n` +
          `* **Running Status**: **${liveStatusData.delayMinutes > 0 ? `+${liveStatusData.delayMinutes} min delay` : 'Running on time'}** (${liveStatusData.state})\n` +
          `* **Journey Progress**: ${liveStatusData.progress.percentage}% completed (${Math.round(liveStatusData.progress.distanceRemainingKm)} km remaining)`;
      } else if (planData && planData.length > 0) {
        replyText = `### 🧭 Available Trains\n\nFound **${planData.length} trains** on this route:\n\n` +
          planData.slice(0, 3).map(t => `* **${t.trainNumber} ${t.trainName}** — Departs **${t.fromStation.departureTime}**, Duration **${t.durationText}** (Reliability: **${t.reliabilityScore}/100**)`).join('\n');
      } else {
        replyText = `I am your **RailGaadi AI Assistant**. You can ask me:\n\n` +
          `* *"Where is train 12002 right now?"*\n` +
          `* *"Will my train arrive on time?"*\n` +
          `* *"Find trains from Delhi to Mumbai tomorrow"*\n` +
          `* *"What's the weather on my route?"*`;
      }
    }

    // Add structured insights
    if (liveStatusData) {
      if (liveStatusData.delayMinutes > 20) {
        insights.push({
          title: 'Delay Alert',
          detail: `Train is running +${liveStatusData.delayMinutes}m behind schedule. Next halt: ${liveStatusData.nextStation?.station.name || 'upcoming station'}.`,
          variant: 'warning',
        });
      } else if (liveStatusData.delayMinutes <= 5) {
        insights.push({
          title: 'High Punctuality',
          detail: 'Train is running on time with high priority clearance on this section.',
          variant: 'success',
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: replyText,
        insights: insights.length > 0 ? insights : undefined,
      },
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: { message: error.message || 'AI assistant encountered an error.' } },
      { status: 500 }
    );
  }
}
