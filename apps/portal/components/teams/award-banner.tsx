import { AwardNames, PortalAward, PortalEvent } from "@lems/types";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { FC } from "react";
import FirstIcon from "../../public/assets/first_icon.svg";
import { localizedAward } from '@lems/season';

interface AwardBannerProps {
  award: PortalAward;
  event: PortalEvent;
}

const AwardBanner: FC<AwardBannerProps> = ({ award, event }) => {
  return (
    <Box
      sx={{
        backgroundColor: `${event.color}`,
        color: "white",
        display: "inline-block",
        height: 170,
        width: 140,
        lineHeight: 1.2,
        marginBottom: 4,
        padding: 2,
        position: "relative",
        textAlign: "center",
        verticalAlign: "top",
        boxSizing: "border-box",
        whiteSpace: "normal",
        boxShadow: "0 10px 5px rgba(0, 0, 0, .1)",
        filter: "drop-shadow(0 10px 5px rgba(0, 0, 0, .1))",
        "-webkit-filter": "drop-shadow(0 10px 5px rgba(0, 0, 0, .1))",
        "&:after": {
          content: '""',
          position: "absolute",
          display: "block",
          border: `60px solid ${event.color}`,
          borderTopWidth: "5px",
          borderBottom: "20px transparent solid",
          top: "100%",
          left: 0,
          width: "100%"
        },
      }}
    >
      <Image
        src={FirstIcon}
        alt="Award Icon"
        width={75}
        height={45}
        style={{ marginBottom: 5, marginTop: 10 }}
      />
      <Box
        sx={{
          display: "table",
          width: "100%",
          height: 35,
          fontWeight: "bold",
        }}
      >
        <Typography fontWeight='bold'>{localizedAward[award.name as AwardNames].name} {award.place}</Typography>
      </Box>

      <Box
        sx={{
          display: "table",
          textTransform: "uppercase",
          height: 50,
          fontSize: 2,
          lineHeight: "110%",
          textAlign: 'center'
        }}
      >
        <Typography>
          {new Date(event.date).getFullYear()} - {event.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default AwardBanner;