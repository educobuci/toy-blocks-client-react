import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import colors from "../constants/colors";
import Status from "./Status";
import { Node as NodeType } from "../types/Node";

type Props = {
  node: NodeType;
  expanded: boolean;
  toggleNodeExpanded: (node: NodeType) => void;
};

const AccordionRoot = styled(Accordion)({
  margin: "16px 0",
  boxShadow: "0px 3px 6px 1px rgba(0,0,0,0.15)",

  "&:before": {
    backgroundColor: "unset",
  },
});

const AccordionSummaryContainer = styled(AccordionSummary)({
  padding: "0 24px",
  "& .MuiAccordionSummary-content": {
    margin: "10px 0 !important", // Avoid change of sizing on expanded
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: colors.faded,
  },
});

const BoxSummaryContent = styled(Box)({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  paddingRight: 20,
});

const TypographyHeading = styled(Typography)({
  fontSize: 17,
  display: "block",
  color: colors.text,
  lineHeight: 1.5,
});

const TypographySecondaryHeading = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  color: colors.faded,
  lineHeight: 2,
}));

const Block = styled(Box)({
  backgroundColor: "#0000001F",
  display: "flex",
  flexDirection: "column",
  padding: 8,
});

const BlockIndex = styled(Typography)({
  fontSize: 10,
  color: "#304FFE",
});

const BlockData = styled(Typography)({
  fontSize: 14,
});

const BlocksContainer = styled(Box)({
  display: "grid",
  gap: 8,
})

const Loading = styled(Typography)({
  fontSize: 14,
  padding: 16,
  textAlign: 'center',
});

const Error = styled(Typography)({
  fontSize: 14,
  padding: 16,
  color: colors.danger,
  textAlign: 'center',
});


const Node: React.FC<Props> = ({ node, expanded, toggleNodeExpanded }) => {
  const formatIndex = React.useCallback((index: number) => {
    return String(index).padStart(3, '0');
  }, []);

  const errored = !node.loading && !node.blocks

  return (
    <AccordionRoot
      elevation={3}
      expanded={expanded}
      onChange={() => toggleNodeExpanded(node)}
    >
      <AccordionSummaryContainer expandIcon={<ExpandMoreIcon />}>
        <BoxSummaryContent>
          <Box>
            <TypographyHeading variant="h5">
              {node.name || "Unknown"}
            </TypographyHeading>
            <TypographySecondaryHeading variant="subtitle1">
              {node.url}
            </TypographySecondaryHeading>
          </Box>
          <Status loading={node.loading} online={node.online} />
        </BoxSummaryContent>
      </AccordionSummaryContainer>
      <AccordionDetails>
        <BlocksContainer>
          { node.loadingBlocks && <Loading>Loading...</Loading> }
          { node.blocks?.map(node =>
            <Block key={node.index}>
              <BlockIndex>{formatIndex(node.index)}</BlockIndex>
              <BlockData>{node.data}</BlockData>
            </Block>
          )}
          { errored && <Error>ERROR LOADING BLOCKS</Error>}
        </BlocksContainer>
      </AccordionDetails>
    </AccordionRoot>
  );
};

export default Node;
