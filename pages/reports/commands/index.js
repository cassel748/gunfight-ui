import React, { useState } from "react";
import CommandsFilter from "./filter";
import { printFile } from "src/utils/file";
import { CircularProgress, Grid } from "@material-ui/core";

export default function Commmands({ }) {
  const [isLoading, setIsLoading] = useState(false);
  const [numbers, setNumbers] = useState(false);

  const performGeneration = async (filter) => {

    try {
      setIsLoading(true);
      if (filter.type === 14 || filter.type === 15) {
        await printFile(`/api/reports/invoice/excel`, filter, "xlsx", "Assessoria", "GET");        // await printFile("/api/reports/invoice", filter, "pdf", null, "GET");
      } else {
        await printFile("/api/reports/invoice", filter, "pdf", null, "GET");
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }

  };

  const performGenerationExcel = async (filter) => {

    try {
      setIsLoading(true);
      await printFile(`/api/reports/invoice/excel`, filter, "xlsx", "Assessoria", "GET"); 
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }

  };

  const performGenerationNumbers = async (filter) => {
    try {
      setNumbers(true);
      setIsLoading(true);
      await printFile(
        "/api/reports/invoice-numbers",
        filter,
        "pdf",
        null,
        "GET"
      );
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
      setNumbers(false);
    }
  };

  return (
    <Grid container spacing={3} p={3}>
      <Grid item xs={12}>
        <CommandsFilter
          onSearch={performGeneration}
          onSearchExcel={performGenerationExcel}
          onSearchNumbers={performGenerationNumbers}
        />

        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: 330,
            }}
          >
            <CircularProgress />
            <br />
            <br />
            Gerando relatório {numbers ? "de vendas," : ","} aguarde...
          </div>
        )}
      </Grid>
    </Grid>
  );
}
