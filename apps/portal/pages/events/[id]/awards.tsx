import { useRef, useEffect, useState } from 'react';
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from 'next';
import { Container, Box, Typography, Stack } from '@mui/material';
import { AwardNames, PortalAward, PortalEvent, PersonalAwardTypes, PersonalAwards } from '@lems/types';
import { localizedAward } from '@lems/season';
import { fetchAwards, fetchEvent } from '../../../lib/api';
import AwardWinner from '../../../components/events/award-winner';
import StyledEventSubtitle from '../../../components/events/styled-event-subtitle';

interface Props {
  awards: PortalAward[];
  event: PortalEvent;
}

const Page: NextPage<Props> = ({ awards, event }) => {
  const awardsByName = awards.reduce(
    (acc, award) => {
      const copy = [...(acc[award.name] ?? []), award];
      acc[award.name] = copy.sort((a, b) => a.place - b.place);
      return acc;
    },
    {} as Record<AwardNames, PortalAward[]>
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const topOffset = containerRef.current.getBoundingClientRect().top;
        setContainerHeight(window.innerHeight - topOffset);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const { advancement, ...restAwards } = awardsByName;

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        height: containerHeight ? `${containerHeight}px` : 'auto'
      }}
    >
      <Typography variant="h1">פרסים</Typography>
      <StyledEventSubtitle event={event} />

      {/* Personal Awards First */}
      {Object.entries(restAwards)
        .filter(([awardName]) => PersonalAwardTypes.includes(awardName as PersonalAwards))
        .map(([awardName, awards]) => {
          if (awards.every(award => !award.winner)) return null;

          return (
            <Box key={awardName} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Typography variant="h6">פרס {localizedAward[awardName as AwardNames].name}</Typography>
              {awards.map((award, index) => (
                <AwardWinner
                  key={index}
                  award={award}
                  winnerText={
                    typeof award.winner === 'string'
                      ? award.winner
                      : `${award.winner?.name} #${award.winner?.number}`
                  }
                />
              ))}
            </Box>
          );
        })}

      {/* Other Awards */}
      {Object.entries(restAwards)
        .filter(([awardName]) => !PersonalAwardTypes.includes(awardName as PersonalAwards))
        .map(([awardName, awards]) => {
          if (awards.every(award => !award.winner)) return null;

          return (
            <Box key={awardName} sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
              <Typography variant="h6">פרס {localizedAward[awardName as AwardNames].name}</Typography>
              {awards.map((award, index) => (
                <AwardWinner
                  key={index}
                  award={award}
                  winnerText={
                    typeof award.winner === 'string'
                      ? award.winner
                      : `${award.winner?.name} #${award.winner?.number}`
                  }
                />
              ))}
            </Box>
          );
        })}

      {advancement?.length > 0 && (
        <Box sx={{ p: 2, mb: 2, border: '1px solid #ccc', borderRadius: '4px' }}>
          <Typography variant="h6">מעפילות לתחרות האליפות</Typography>
          <Box sx={{ mt: 1 }}>
            {advancement.map((award, index) => {
              if (!award.winner || typeof award.winner === 'string') return null;
              return (
                <Typography key={index}>
                  {award.winner.name} #{award.winner.number}
                </Typography>
              );
            })}
          </Box>
        </Box>
      )}
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const eventId = ctx.params?.id as string;
  const { event } = await fetchEvent(eventId);
  const awards = await fetchAwards(eventId);
  if (awards === null) return { redirect: { destination: `/events/${eventId}`, permanent: false } };

  return { props: { awards, event } };
};

export default Page;
