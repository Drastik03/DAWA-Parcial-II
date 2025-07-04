import React from 'react';
import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';

const ForwardedTextField = React.forwardRef((props, ref) => (
  <TextField {...props} inputRef={ref} />
));

const CustomTextField = styled(ForwardedTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '0.8',
  },
  '& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '1',
  },
  '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200],
  },
}));

export default CustomTextField;
