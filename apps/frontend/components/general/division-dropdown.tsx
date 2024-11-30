import React, { useState, useRef, CSSProperties, useEffect } from 'react';
import { WithId } from 'mongodb';
import { SelectProvider, useSelect } from '@mui/base';
import { useOption } from '@mui/base';
import { FllEvent, Division } from '@lems/types';
import { Box, IconButton, Typography } from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeRounded';
import { apiFetch } from '../../lib/utils/fetch';

interface DropdownOptionProps {
  id: string;
  name: string;
  color: CSSProperties['color'];
}

const DropdownOption: React.FC<DropdownOptionProps> = ({ id, name, color }) => {
  const { getRootProps, highlighted } = useOption({
    value: id,
    disabled: false,
    label: name
  });

  return (
    <Box
      {...getRootProps()}
      bgcolor={highlighted ? '#daecff' : undefined}
      padding={0.5}
      display="flex"
      flexDirection="row"
      gap={1}
      justifyContent="center"
      alignItems="center"
      borderRadius={1}
      paddingX={2}
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e5eaf2' } }}
    >
      <Box height={10} width={10} borderRadius="50%" bgcolor={color} />
      <Typography>{name}</Typography>
    </Box>
  );
};

interface DivisionDropdownProps {
  event: WithId<FllEvent>;
  selected: string;
  onSelect: (divisionId: string) => void;
}

const DivisionDropdown: React.FC<DivisionDropdownProps> = ({ event, selected, onSelect }) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [divisions, setDivisions] = useState<WithId<Division>[]>([]);

  useEffect(() => {
    apiFetch(`/api/events/${event._id}/divisions`)
      .then(res => res.json())
      .then(data => setDivisions(data));
  }, [event._id]);

  const { getButtonProps, getListboxProps, contextValue } = useSelect<string, false>({
    listboxRef,
    onOpenChange: setOpen,
    open: open,
    value: selected,
    onChange(event, value) {
      value && onSelect(value);
    }
  });

  return (
    <Box position="relative">
      <IconButton {...getButtonProps()} sx={{ position: 'relative' }}>
        <HomeIcon />
      </IconButton>
      <Box
        {...getListboxProps()}
        position="absolute"
        height="auto"
        maxWidth={250}
        zIndex={1}
        bgcolor="white"
        borderRadius={2}
        paddingY={1}
        paddingX={1.5}
        marginTop={2}
        sx={{
          transition: 'opacity 0.1s ease, visibility 0.1s step-end;',
          visibility: open ? 'visible' : 'hidden',
          opacity: open ? 1 : 0
        }}
        display={'flex'}
        flexDirection="column"
        gap={1}
      >
        <SelectProvider value={contextValue}>
          {divisions.map((division, index) => (
            <DropdownOption
              key={index}
              id={division._id.toString()}
              name={division.name}
              color={division.color}
            />
          ))}
        </SelectProvider>
      </Box>
    </Box>
  );
};

export default DivisionDropdown;
