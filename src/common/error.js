import React, { useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';

export default function ErrorTemplate() {
  useEffect(() => {
    setTimeout(() => {
      window.location.reload()
    }, 300);
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300 }
      }
    >
      <CircularProgress />
    </div>
  )
}
