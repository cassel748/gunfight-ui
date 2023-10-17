import React, { useEffect } from 'react';
import { CircularProgress } from '@material-ui/core';

export default function ErrorTemplate() {
  useEffect(() => {
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload()
      }
    }, 300);
  }, [])

  return (
    <div className="error-boundary">
      <CircularProgress />
    </div>
  )
}
