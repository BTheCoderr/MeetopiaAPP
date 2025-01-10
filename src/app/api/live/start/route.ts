import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

const generateToken = (channelName: string, uid: string) => {
  const appId = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  const role = RtcRole.PUBLISHER;

  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate a unique channel name
    const channelName = `${session.user.id}-${Date.now()}`;

    // Create the live stream record
    const liveStream = await prisma.liveStream.create({
      data: {
        title,
        description,
        userId: session.user.id,
        channelName,
        status: 'LIVE',
        startedAt: new Date(),
      },
    });

    // Generate Agora token
    const token = generateToken(channelName, session.user.id);

    return NextResponse.json({
      streamId: liveStream.id,
      channelName,
      token,
      appId: process.env.AGORA_APP_ID,
    });
  } catch (error) {
    console.error('Error starting live stream:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 