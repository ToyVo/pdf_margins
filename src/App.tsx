import React, {ChangeEvent, useState} from 'react';
import {centerPdf} from './CenterPDF';
import {Box, Button, Grid, Stack, Typography} from '@mui/material';

export const App = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [centeredUrl, setCenteredUrl] = useState('');

  const fileChangeHandler = async (event: ChangeEvent<HTMLInputElement>) => {
    const originalBytes = await event?.target?.files?.[0]?.arrayBuffer();
    if (originalBytes) {
      const originalBlob = new Blob([originalBytes]);
      setOriginalUrl(URL.createObjectURL(originalBlob));
      const centeredBytes = await centerPdf(originalBytes, {
        drawAlignment: true,
        drawBorder: true,
        nudgeBorderHeight: 7,
        nudgeBorderWidth: 7,
      });
      const centeredBlob = new Blob([centeredBytes]);
      setCenteredUrl(URL.createObjectURL(centeredBlob));
    }
  }

  return (
    <Stack component="main" sx={{height: '100%'}} spacing={2}>
      <Typography variant="h1">Center PDF</Typography>
      <Box sx={{paddingLeft: 2}}>
        <Button variant="contained" component="label">
          Upload
          <input hidden accept="application/pdf" onChange={fileChangeHandler} type="file"/>
        </Button>
      </Box>
      <Grid sx={{flexGrow: 1, padding: 2, paddingTop: 0}} container gap={2}>
        <Grid item xs>
          {originalUrl &&
            <Box component="iframe" title="original" src={originalUrl} sx={{width: '100%', height: '100%'}}></Box>}
        </Grid>
        <Grid item xs>
          {centeredUrl &&
            <Box component="iframe" title="original" src={centeredUrl} sx={{width: '100%', height: '100%'}}></Box>}
        </Grid>
      </Grid>
    </Stack>
  );
}
