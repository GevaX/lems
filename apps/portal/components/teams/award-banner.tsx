import { PortalAward, PortalEvent } from "@lems/types";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import { FC } from "react";

interface AwardBannerProps {
  award: PortalAward;
  event: PortalEvent;
}

const AwardBanner: FC<AwardBannerProps> = ({ award, event }) => {
  return (
    <Box
      sx={{
        backgroundColor: "#007bff",
        color: "white",
        display: "inline-block",
        height: 170,
        width: 250,
        lineHeight: 1.2,
        marginBottom: 4,
        padding: 2,
        position: "relative",
        textAlign: "center",
        verticalAlign: "top",
        whiteSpace: "normal",
        boxShadow: "0 5px 5px rgba(0, 0, 0, .1)",
      }}
    >
      <Image
        src="../../public/assets/first_icon.svg"
        alt="Award Icon"
        width={75}
        height={45}
        style={{ marginBottom: 10, marginTop: 10 }}
      />
      <Box
        sx={{
          display: "table",
          width: "100%",
          height: 35,
          fontWeight: "bolder",
          marginTop: 1,
          marginBottom: 1,
          fontStyle: "italic",
          textTransform: "uppercase",
          fontSize: "100%",
        }}
      >
        <Typography variant="h6">{award.name}</Typography>
      </Box>
      <Box
        sx={{
          display: "table",
          textTransform: "uppercase",
          height: 50,
          width: "100%",
          fontSize: "75%",
          lineHeight: "110%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        <Typography>
          {new Date(event.date).getFullYear()} {event.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default AwardBanner;