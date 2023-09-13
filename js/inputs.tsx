import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TableVirtuoso } from "react-virtuoso";
import { Anchor, Checkbox, Paper, Table, useMantineTheme } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

import { useBasePath } from "@hooks";

import { useRuleBoardFilters } from "@pages/ruleBoard/hooks";
import {
  useRuleBoardActions,
  useRules,
  useSelectedGroupRules,
  useSelectedRules,
  useStoreFindingsCount,
} from "@pages/ruleBoard/stores";
import { RuleBoardTableRow } from "@pages/ruleBoard/types";

import { RuleBoardZeroStates } from "../RuleBoardZeroStates";
import { RuleLabels } from "../RuleLabels";
import { RuleTableActionButton } from "../RuleTableActionButton";
import { RuleTableConfidence } from "../RuleTableConfidence";
import { RuleTableName } from "../RuleTableName";
import { RuleTableRulesets } from "../RuleTableRulesets";
import { RuleTableSeverity } from "../RuleTableSeverity";
import { SourceIcon } from "../SourceIcon";

export interface RulesTableProps {
  rows: RuleBoardTableRow[];
  group?: string;
}

const ROW_HEIGHT = 52;
const HEADER_HEIGHT = 56;

export const RulesTable: FC<RulesTableProps> = ({ rows, group }) => {
  // rule board state
  const selectedRules = useSelectedRules();
  const { toggleSelectedRule } = useRuleBoardActions();
  const allRules = useRules();
  const findingsCount = useStoreFindingsCount();
  const { query, setQuery } = useRuleBoardFilters();

  // useQuery
  const { colors } = useMantineTheme();
  const basePath = useBasePath();
  const [lastCheckedRule, setLastCheckedRule] = useState(-1);
  const { height: vh } = useViewportSize();

  // effects
  useEffect(() => {
    // Reset the last checked rule to -1 whenever the filtered rows changed
    setLastCheckedRule(-1);
  }, [rows]);

  // handlers
  const handleSelectAll = () => {
    const check = selectedAndFilteredRules.length !== rows.length;
    rows.forEach((row: RuleBoardTableRow, idx: number) => {
      toggleSelectedRule(
        row,
        check,
        false,
        idx,
        rows,
        row.vulnerabilityClasses
      );
    });
  };

  onClick={(e) => {
                const element = e.target as HTMLTableCellElement;
                const columnIndex = element.cellIndex as ColumnIndices;
                const targetColumn = RulesTableColumns.at(
                  columnIndex as ColumnIndices
                );
                if (!targetColumn) {
                  return;
                }

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    row: RuleBoardTableRow,
    index: number
  ) => {
    toggleSelectedRule(
      row,
      e.target.checked,
      (e.nativeEvent as MouseEvent).shiftKey,
      lastCheckedRule,
      rows,
      row.vulnerabilityClasses
    );
    setLastCheckedRule(index);
  };

  const selectedGroupRules = useSelectedGroupRules();
  const selectedAndFilteredRules = group
    ? selectedGroupRules[group]?.filter((r) => rows.includes(r)) || []
    : selectedRules.filter((r) => rows.includes(r));

  // calculate table height in group view based on rows height and headers
  const calculatedHeight = Math.min(
    ROW_HEIGHT * rows.length + HEADER_HEIGHT,
    0.7 * vh
  );

  {rowSelect?.onButtonClick && (
        <Button
          disabled={Object.keys(table.state.selectedRowIds).length === 0}
          onClick={() =>
            rowSelect.onButtonClick!(
              table.selectedFlatRows.map((r) => r.original)
            )
          }
          style={{ marginLeft: "auto", alignSelf: "baseline" }}
        >
          {rowSelect.buttonText}
        </Button>
      )}

  return (
    <Paper
      bg="#fff"
      h={group ? calculatedHeight : "100%"}
      pos="relative"
      p="1px"
      withBorder={!group}
    >
      <RuleBoardZeroStates
        allRulesLength={allRules.length}
        filteredRulesLength={rows.length}
        setQuery={setQuery}
      />
      {allRules.length > 0 && rows.length > 0 && (
        <TableVirtuoso
          data={rows}
          style={{ height: "100%" }}
          components={{
            Table: (props) => (
              <Table
                {...props}
                sx={(theme) => ({
                  borderCollapse: "separate",
                  "thead tr": {
                    "& th": {
                      borderBottom: `2px solid ${theme.colors["gray"][3]}`,
                    },
                  },
                  "thead tr, th": {
                    backgroundColor: "white",
                    opacity: 1,
                  },
                })}
                fontSize="xs"
              />
            ),
          }}
          fixedHeaderContent={() => (
            <tr>
              <th style={{ width: "5%" }}>
                {group ? (
                  <Checkbox
                    onChange={handleSelectAll}
                    checked={
                      rows.length > 0 &&
                      selectedAndFilteredRules.length === rows.length
                    }
                    indeterminate={
                      (group ? selectedGroupRules[group] ?? [] : selectedRules)
                        .length > 0 &&
                      selectedAndFilteredRules.length !== rows.length
                    }
                    pl={group ? 8 : 0}
                  />
                ) : (
                  ""
                )}
              </th>
              <th style={{ width: "20%", paddingLeft: 0 }}>Rule name</th>
              <th style={{ width: "20%" }}>Labels</th>
              <th style={{ textAlign: "right" }}>Open findings</th>
              <th style={{ textAlign: "right" }}>Fix rate</th>
              <th style={{ textAlign: "center", width: "5%" }}>Severity</th>
              <th style={{ textAlign: "center", width: "5%" }}>Confidence</th>
              <th style={{ width: "5%", textAlign: "center" }}>Source</th>
              <th style={{ width: "10%" }}>Ruleset</th>
              <th style={{ width: "10%" }}>Mode</th>
            </tr>
          )}
          itemContent={(idx, row) => {
            const hasNonZeroFindingsCount =
              findingsCount &&
              findingsCount[row.rulePath] !== undefined &&
              findingsCount[row.rulePath].open_findings_count !== 0;
            return (
              <>
                <td
                  style={{
                    paddingRight: 0,
                    width: "5%",
                    // Fix the height of each row so that we can calculate the table virtuoso height
                    height: `${ROW_HEIGHT}px`,
                  }}
                >
                  <Checkbox
                    checked={Boolean(
                      selectedRules.find((r) => r.rulePath === row.rulePath)
                    )}
                    onChange={(e) => handleCheckboxChange(e, row, idx)}
                    pl={group ? 8 : 0}
                  />
                </td>
                <td style={{ width: "20%", paddingLeft: 0 }}>
                  <RuleTableName
                    rulePath={row.rulePath}
                    ruleVersion={row.ruleVersion}
                    query={query}
                  />
                </td>
                <td style={{ width: "20%" }}>
                  <RuleLabels rulePath={row.rulePath} query={query} />
                </td>
                <td align="right" style={{ width: "5%" }}>
                  {!findingsCount ? (
                    "..."
                  ) : hasNonZeroFindingsCount ? (
                    <Anchor
                      component={Link}
                      to={`${basePath}/findings?rule=${
                        findingsCount[row.rulePath]?.rule_name
                      }`}
                    >
                      {findingsCount[row.rulePath].open_findings_count}
                    </Anchor>
                  ) : (
                    0
                  )}
                </td>
                <td align="right" style={{ width: "5%" }}>
                  {!findingsCount ? (
                    "..."
                  ) : findingsCount[row.rulePath] ? (
                    `${Math.floor(findingsCount[row.rulePath].fix_rate * 100)}%`
                  ) : (
                    <span style={{ color: colors["dark"][2] }}>&ndash;</span>
                  )}
                </td>
                <td align="center" style={{ width: "5%" }}>
                  <RuleTableSeverity severity={row.severity} />
                </td>
                <td align="center" style={{ width: "5%" }}>
                  <RuleTableConfidence confidence={row.confidence} />
                </td>
                <td style={{ width: "5%", textAlign: "center" }}>
                  <SourceIcon source={row.source} />
                </td>
                <td style={{ width: "10%" }}>
                  <RuleTableRulesets rulesets={row.rulesets} />
                </td>
                <td style={{ width: "10%" }}>
                  <RuleTableActionButton
                    currentPolicy={row.policy}
                    rule={row}
                  />
                </td>
              </>
            );
          }}
        />
      )}
    </Paper>
  );
};
