import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest } from 'next/server'
import { User, Role } from '@/lib/generated/prisma/client';
import { db } from '@/lib/db';
import { clerkClient } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    const eventType = evt.type
    
    // When user is created or updated
    if (eventType === 'user.created' || eventType === 'user.updated') {
        const data = evt.data;
        
        const roleMap: Record<string, Role> = {
            USER: Role.USER,
            ADMIN: Role.ADMIN,
            SELLER: Role.SELLER,
        };
        const role: Role = roleMap[data.private_metadata.role as string] || Role.USER
        
        const user: Partial<User> = {
            id: data.id,
            name: `${data.first_name} ${data.last_name}`,
            email: data.email_addresses[0].email_address,
            picture: data.image_url,
            role: role,
        }

        if(!user) return;

        const dbUser = await db.user.upsert({
            where:{
                email:user.email
            },
            update:user,
            create:{
                id: user.id!,
                name: user.name!,
                email: user.email!,
                picture: user.picture!,
                role: user.role || "USER",
            }
        });

        const client = await clerkClient();
        await client.users.updateUserMetadata(data.id, {
            privateMetadata: {
            role: dbUser.role || 'USER',
            },
        });
    }

    // When user is deleted
    if (eventType === 'user.deleted'){
        const userId = evt.data.id;
        await db.user.delete({
            where: {
                id: userId
            }
        });
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)

    return new Response('Error verifying webhook', { status: 400 })
  }
}