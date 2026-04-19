
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')
    const body = await req.text()
    let event

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '',
            undefined,
            cryptoProvider
        )
    } catch (err) {
        return new Response(err.message, { status: 400 })
    }

    const subscription = event.data.object as Stripe.Subscription

    // Handle various subscription events
    switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            await updateSubscription(subscription)
            break
        case 'invoice.payment_succeeded':
            // Optionally handle successful payment specifically if needed
            if (subscription.status === 'active') {
                await updateSubscription(subscription)
            }
            break
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
})

async function updateSubscription(subscription: Stripe.Subscription) {
    const customerId = subscription.customer

    // Find user by customer ID
    // Note: This relies on us saving the customer ID first during checkout or signup
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

    if (profile) {
        await supabaseAdmin
            .from('profiles')
            .update({
                subscription_status: subscription.status,
                stripe_subscription_id: subscription.id,
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                is_pro: subscription.status === 'active'
            })
            .eq('id', profile.id)
    }
}
