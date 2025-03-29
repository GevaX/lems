import { useEffect, useState } from 'react';
import { PortalTeam } from '@lems/types';
import {
  Table,
  Typography,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TableHead,
  Link,
  CircularProgress
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { fetchAllTeams } from '../../lib/api';

const GlobalTeamList: React.FC = () => {
  const [teams, setTeams] = useState<Array<PortalTeam>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await fetchAllTeams();
        const uniqueTeams = Array.from(new Map(data.map(team => [team.number, team])).values());
        const sortedTeams = uniqueTeams.sort((a, b) => a.number - b.number);
        setTeams(sortedTeams);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTeams();
    
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (  
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
          <TableCell>
              <Typography fontWeight={500}>מספר</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={500}>קבוצה</Typography>
            </TableCell>
            <TableCell>
              <Typography fontWeight={500}>מיקום</Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {teams.map(team => (
            <TableRow
              key={team.id}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                },
                '&:active': {
                  backgroundColor: 'rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <TableCell>
                <Link
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace'
                  }}
                >
                  #{team.number}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  {team.name}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  {team.affiliation.name}, {team.affiliation.city}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/teams/${team.number}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <ChevronLeftIcon />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default GlobalTeamList;