import { Subscription, Task } from '../store/useStore';

interface AIContext {
    subscriptions: Subscription[];
    tasks: Task[];
    language: 'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'pt' | 'ar';
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

    const langNames = {
        en: 'English',
        tr: 'Turkish',
        es: 'Spanish',
        de: 'German',
        fr: 'French',
        it: 'Italian',
        pt: 'Portuguese',
        ar: 'Arabic'
    };

    const langInstructions = `IMPORTANT: Respond ENTIRELY in ${langNames[language]}. Be warm and personal. Give a UNIQUE angle every time — vary between financial savings tips, responsibility management, habit forming, or motivational nudges. Never repeat the same advice.`;

    const systemPrompt = `You are Luxtra AI assistant. You help users manage their life — subscriptions, responsibilities, and spending.
${langInstructions}
Keep responses concise (max 3-4 sentences). Be actionable and highly specific to the user's data.
Use 1 emoji max. Be creative and vary your angle each time you respond.

User's current data:
- Total Monthly Spending: ${totalMonthly.toFixed(2)}
- Total Yearly Spending: ${totalYearly.toFixed(2)}
- Annual spending: ${(totalMonthly * 12 + totalYearly).toFixed(0)}
- Number of subscriptions: ${subscriptions.length}
- Most expensive: ${sortedSubs[0]?.name || 'None'} (${sortedSubs[0]?.amount.toFixed(2) || '0'})
- Top category: ${sortedCategories[0]?.[0] || 'None'} (${sortedCategories[0]?.[1].toFixed(2) || '0'})
- Active responsibilities: ${upcomingTasks.length}
- Recurring responsibilities: ${recurringTasks.length}
- Upcoming tasks: ${upcomingTasks.slice(0, 3).map(t => t.title).join(', ') || 'None'}
- Current time context: ${new Date().toLocaleDateString()}`;

    if (userQuestion) {
        return `${systemPrompt}\n\nUser asks: ${userQuestion}`;
    }
    const hour = new Date().getHours();
    const focusArea = hour < 10 ? 'morning motivation and planning' :
        hour < 14 ? 'spending optimization' :
            hour < 18 ? 'responsibility and task management' :
                'evening review and savings opportunities';

    return `${systemPrompt}\n\nGive a smart, personalized insight focused on: ${focusArea}.
Be specific to the user's actual data above. Pick ONE angle and make it actionable.
Format: Just a natural 2-3 sentence paragraph. No bullet points.`;
}

export async function getAIInsight(context: AIContext, userQuestion?: string): Promise<string> {
    const prompt = buildPrompt(context, userQuestion);

    try {
        const { supabase } = await import('./supabase');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
             return userQuestion ? "Oturum süresi dolmuş. Lütfen tekrar giriş yap." : generateLocalInsight(context);
        }

        try {
            const { data, error } = await supabase.functions.invoke('handle-ai-chat', {
                 body: { prompt }
            });

            if (error) {
                console.warn("AI Edge Function failed gracefully, falling back to local.");
                return generateLocalInsight(context);
            }

            if (data?.error) {
                console.warn("API Error:", data.error);
                return generateLocalInsight(context); 
            }

            if (data?.reply) {
                 return data.reply;
            }

            return generateLocalInsight(context);
        } catch (invokeError) {
             console.warn("AI Edge Invoke failed gracefully, falling back to local.");
             return generateLocalInsight(context);
        }
    } catch (_error) {
        return generateLocalInsight(context);
    }
}
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

    const yearlyPlans = subscriptions.filter(s => s.billingCycle === 'yearly');
    const monthlyPlans = subscriptions.filter(s => s.billingCycle === 'monthly');
    const totalYearly = yearlyPlans.reduce((a, c) => a + c.amount, 0);
    const annualized = totalMonthly * 12 + totalYearly;

    const now = new Date();
    const dueIn7 = subscriptions.filter(s => {
        const diff = Math.ceil((new Date(s.nextBillingDate).getTime() - now.getTime()) / 86400000);
        return diff >= 0 && diff <= 7;
    });

    const insightsTR: (string | null)[] = [
        topSub ? `💡 En yüksek harcaman "${topSub.name}" (${topSub.amount.toFixed(2)}₺). Bu tek kalem aylık bütçenin önemli bir parçası — hâlâ değiyor mu?` : null,
        totalMonthly > 0 ? `📊 Aylık ${totalMonthly.toFixed(2)}₺ harcıyorsun, yıllık bazda bu ${annualized.toFixed(0)}₺ yapıyor. Küçük kesintiler zamanla büyük fark yaratır.` : null,
        urgentTask ? `⏰ "${urgentTask.title}" yakında son buluyor. Ertelemeden planını oluşturmaya başla.` : null,
        recurringTasks.length > 0 ? `🔄 ${recurringTasks.length} tekrarlayan sorumluluğun var — Luxtra bunları otomatik takip ediyor.` : null,
        subscriptions.length > 3 ? `🔍 ${subscriptions.length} aktif aboneliğin var. Son 30 günde hangilerini gerçekten kullandın?` : null,
        monthlyPlans.length > 1 ? `💰 Aylık planlardan birini yıllığa çevirmek %10-20 tasarruf sağlayabilir. ${sortedSubs[0]?.name} iyi bir başlangıç olabilir.` : null,
        dueIn7.length > 0 ? `🗓️ Bu haftaiçinde ${dueIn7.length} ödeme var: ${dueIn7.map(s => s.name).join(', ')}. Hesabında hazır bakiye var mı?` : null,
        sortedCategories[0] ? `📁 "${sortedCategories[0][0]}" kategorisine aylık ${sortedCategories[0][1].toFixed(2)}₺ harcıyorsun. Bu alanda alternatifler var mı?` : null,
        upcomingTasks.length > 2 ? `📌 ${upcomingTasks.length} bekleyen görevin var. Önce "${upcomingTasks[0]?.title}" üzerine odaklan.` : null,
        totalMonthly > 100 ? `🎯 Aylık harcamanın %10'unu kesmek bile yılda ${(totalMonthly * 12 * 0.1).toFixed(0)}₺ tasarruf sağlar.` : null,
        yearlyPlans.length > 0 ? `📅 ${yearlyPlans.length} yıllık planın var. Yenileme tarihleri yaklaşırken seni uyaracağız.` : null,
        subscriptions.length === 0 ? `✨ Henüz abonelik eklemedin. Düzenli ödemelerini ekleyerek nereye para gittiğini görmeye başla.` : null,
        totalMonthly > 0 && yearlyPlans.length === 0 ? `📈 Hiç yıllık planın yok. Mevcut aboneliklerinden biri yıllık teklife sahip mi diye kontrol et — genellikle %15+ daha ucuz.` : null,
        upcomingTasks.length === 0 && subscriptions.length > 0 ? `🌟 Tüm sorumluluklarını tamamladın! Şu an sadece abonelik takibindesin — harika bir düzen.` : null,
    ];

    const insightsEN: (string | null)[] = [
        topSub ? `💡 Your biggest expense is "${topSub.name}" (${topSub.amount.toFixed(2)}). It's a significant chunk of your budget — still worth it?` : null,
        totalMonthly > 0 ? `📊 You spend ${totalMonthly.toFixed(2)}/month on subscriptions — that's ${annualized.toFixed(0)}/year. Small cuts add up to real savings.` : null,
        urgentTask ? `⏰ "${urgentTask.title}" is coming up soon. Don't let it sneak up on you — start planning today.` : null,
        recurringTasks.length > 0 ? `🔄 You have ${recurringTasks.length} recurring responsibilities. Luxtra is tracking them automatically.` : null,
        subscriptions.length > 3 ? `🔍 ${subscriptions.length} active subscriptions — have you actually used all of them in the past month?` : null,
        monthlyPlans.length > 1 ? `💰 Switching one monthly plan to yearly could save 10-20%. ${sortedSubs[0]?.name} might be a great candidate.` : null,
        dueIn7.length > 0 ? `🗓️ ${dueIn7.length} payment(s) due this week: ${dueIn7.map(s => s.name).join(', ')}. Make sure your account is ready.` : null,
        sortedCategories[0] ? `📁 You spend ${sortedCategories[0][1].toFixed(2)}/mo on ${sortedCategories[0][0]}. Any cheaper alternatives worth exploring?` : null,
        upcomingTasks.length > 2 ? `📌 ${upcomingTasks.length} tasks pending. Focus on "${upcomingTasks[0]?.title}" first.` : null,
        totalMonthly > 100 ? `🎯 Cutting just 10% of your monthly spend would save ${(totalMonthly * 12 * 0.1).toFixed(0)}/year. What could you drop?` : null,
        yearlyPlans.length > 0 ? `📅 You have ${yearlyPlans.length} yearly plan(s). We'll alert you before each renewal.` : null,
        subscriptions.length === 0 ? `✨ No subscriptions yet. Add your regular payments to start seeing where your money goes.` : null,
        totalMonthly > 0 && yearlyPlans.length === 0 ? `📈 None of your plans are yearly. Most services offer 15%+ savings on annual billing — worth checking out.` : null,
        upcomingTasks.length === 0 && subscriptions.length > 0 ? `🌟 All responsibilities handled! You're staying on top of things — great work.` : null,
    ];

    const pool = (language === 'tr' ? insightsTR : insightsEN).filter(Boolean) as string[];

    if (pool.length === 0) {
        return language === 'tr' ? '✨ Her şey yolunda görünüyor!' : '✨ Everything looks on track!';
    }
    const seed = Date.now();
    const shuffled = [...pool].sort((a, b) => Math.sin(seed + pool.indexOf(a) * 137) - Math.sin(seed + pool.indexOf(b) * 137));
    return shuffled.slice(0, 2).join('\n\n');
}

