import { getServerSession } from 'next-auth';
import { Settings } from '~/components/settings';
import { authOptions } from '~/server/auth';
import { prisma } from '~/server/db';
export default async function SettingsPage() {
  // NOTE: what's weird about this API is that it should have the
  // param to be required but it's not for some reason
  const session = await getServerSession(authOptions);

  if (!session?.user || !session?.user.name) {
    return null;
  }

  const profileData = await prisma.user.findFirstOrThrow({
    where: {
      id: session.user.id,
    },
    include: {
      userLinks: true,
    },
    orderBy: {
      updatedAt: 'asc',
    },
  });

  // NOTE: make the user links have 4 at all times
  const userLinks = (profileData.userLinks = [
    ...profileData.userLinks,
    ...Array(4 - profileData.userLinks.length).fill({
      id: null,
      url: '',
    }),
  ])
    // NOTE: sort the user links so empty strings are at the bottom
    .sort((a, b) => b.url.localeCompare(a.url));

  return (
    <Settings
      profileData={{
        bio: profileData.bio,
        userLinks,
      }}
    />
  );
}