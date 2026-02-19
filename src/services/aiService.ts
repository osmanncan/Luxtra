import { Subscription, Task } from '../store/useStore';

// Using free Gemini API (Google AI)
// You can get a free API key from: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = 'AIzaSyDummyKeyReplace'; // Replace with your key
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface AIContext {
    subscriptions: Subscription[];
    tasks: Task[];
    language: 'en' | 'tr';
}

function buildPrompt(context: AIContext, userQuestion?: string): string {
    const { subscriptions, tasks, language } = context;

    const totalMonthly = subscriptions
        .filter(s => s.billingCycle === 'monthly')
        .reduce((a, c) => a + c.amount, 0);

    const totalYearly = subscriptions
        .filter(s => s.billingCycle === 'yearly')
        .reduce((a, c) => a + c.amount, 0);

    const sortedSubs = [...subscriptions].sort((a, b) => b.amount - a.amount);
    const topCategory = subscriptions.reduce<Record<string, number>>((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
        return acc;
    }, {});

    const sortedCategories = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);

    const upcomingTasks = tasks
        .filter(t => !t.isCompleted)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const recurringTasks = tasks.filter(t => t.isRecurring);

    const langInstructions = language === 'tr'
        ? 'IMPORTANT: Respond entirely in Turkish. Be warm and personal.'
        : 'Respond in English. Be warm and personal.';

    const systemPrompt = `You are LifeOS AI assistant. You help users manage their life - subscriptions, responsibilities, and spending.
${langInstructions}
Keep responses concise (max 3-4 sentences). Be actionable and specific.
Use emoji sparingly for warmth.

User's current data:
- Total Monthly Spending: ${totalMonthly.toFixed(2)}
- Total Yearly Spending: ${totalYearly.toFixed(2)}
- Annual spending: ${(totalMonthly * 12 + totalYearly).toFixed(0)}
- Number of subscriptions: ${subscriptions.length}
- Most expensive: ${sortedSubs[0]?.name || 'None'} (${sortedSubs[0]?.amount.toFixed(2) || '0'})
- Top category: ${sortedCategories[0]?.[0] || 'None'} (${sortedCategories[0]?.[1].toFixed(2) || '0'})
- Active responsibilities: ${upcomingTasks.length}
- Recurring responsibilities: ${recurringTasks.length}
- Upcoming tasks: ${upcomingTasks.slice(0, 3).map(t => t.title).join(', ') || 'None'}`;

    if (userQuestion) {
        return `${systemPrompt}\n\nUser asks: ${userQuestion}`;
    }

    return `${systemPrompt}\n\nGive a smart, personalized insight about the user's financial health and upcoming responsibilities. Focus on:
1. Where they spend the most
2. A practical saving tip
3. Any urgent upcoming responsibility

Format: Just a natural paragraph, 3-4 sentences max.`;
}

export async function getAIInsight(context: AIContext, userQuestion?: string): Promise<string> {
    const prompt = buildPrompt(context, userQuestion);

    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 256,
                },
            }),
        });

        if (!response.ok) {
            return generateLocalInsight(context);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return generateLocalInsight(context);
        }

        return text.trim();
    } catch (_error) {
        return generateLocalInsight(context);
    }
}

// Smart local insights when API is not available
function generateLocalInsight(context: AIContext): string {
    const { subscriptions, tasks, language } = context;

    const totalMonthly = subscriptions
        .filter(s => s.billingCycle === 'monthly')
        .reduce((a, c) => a + c.amount, 0);

    const sortedSubs = [...subscriptions].sort((a, b) => b.amount - a.amount);
    const topSub = sortedSubs[0];

    const upcomingTasks = tasks
        .filter(t => !t.isCompleted)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const urgentTask = upcomingTasks[0];
    const recurringTasks = tasks.filter(t => t.isRecurring);

    const topCategory = subscriptions.reduce<Record<string, number>>((acc, sub) => {
        acc[sub.category] = (acc[sub.category] || 0) + sub.amount;
        return acc;
    }, {});
    const sortedCategories = Object.entries(topCategory).sort((a, b) => b[1] - a[1]);

    const insights = language === 'tr' ? [
        topSub ? `💡 En büyük harcaman ${topSub.name} (${topSub.amount.toFixed(2)}₺). Aylık toplam ${totalMonthly.toFixed(2)}₺, yılda yaklaşık ${(totalMonthly * 12).toFixed(0)}₺ ediyor. ${sortedCategories[0] ? `En çok ${sortedCategories[0][0]} kategorisine harcıyorsun.` : ''}` : '',
        urgentTask ? `⏰ "${urgentTask.title}" yaklaşıyor, şimdiden hazırlanmaya başla.` : '',
        recurringTasks.length > 0 ? `🔄 ${recurringTasks.length} tekrarlayan sorumluluğun var. Bunları otomatik takip ediyoruz.` : '',
        subscriptions.length > 3 ? `🔍 ${subscriptions.length} aktif aboneliğin var. Gerçekten hepsini kullanıyor musun? Kullanmadıklarını iptal etmeyi düşün.` : '',
        totalMonthly > 50 ? `💰 Aylık ${totalMonthly.toFixed(2)}₺ harcıyorsun. Yıllık planlara geçerek %15-20 tasarruf edebilirsin.` : '',
    ].filter(Boolean) : [
        topSub ? `💡 Your biggest expense is ${topSub.name} (${topSub.amount.toFixed(2)}). Monthly total is ${totalMonthly.toFixed(2)}, that's ~${(totalMonthly * 12).toFixed(0)}/year. ${sortedCategories[0] ? `${sortedCategories[0][0]} is your top spending category.` : ''}` : '',
        urgentTask ? `⏰ "${urgentTask.title}" is coming up soon. Start preparing now.` : '',
        recurringTasks.length > 0 ? `🔄 You have ${recurringTasks.length} recurring responsibilities. We're tracking them automatically.` : '',
        subscriptions.length > 3 ? `🔍 You have ${subscriptions.length} active subscriptions. Are you really using all of them? Consider canceling unused ones.` : '',
        totalMonthly > 50 ? `💰 You spend ${totalMonthly.toFixed(2)}/month. Switching to yearly plans could save you 15-20%.` : '',
    ].filter(Boolean);

    // Pick 2-3 random insights
    const shuffled = insights.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).join('\n\n');
}
