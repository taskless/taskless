import React, { useCallback, useState } from "react";
import cx from "classnames";

type OpenMap = {
  [id: string]: boolean | undefined;
};

type Data = {
  [column: string]: any;
};

interface DP<T> {
  data: T;
  record: T;
}

export interface DetailsRenderer<T> extends DP<T> {
  close: () => void;
}

interface DataTableProps<T> {
  data: T[];
  className?: string;
  keyOf?: (d: T) => string;
  columns: {
    name: string;
    headerClassName?: string;
    cellClassName?: string;
    renderValue: React.FC<DP<T>>;
    title?: (props: DP<T>) => string;
  }[];
  hasDetailsColumn?: boolean;
  detailsButtonClassName?: string;
  renderDetails?: React.FC<DetailsRenderer<T>>;
}

const DEFAULT_HEAD =
  "py-3.5 px-3 text-left text-sm font-semibold text-gray-900";
const DEFAULT_CELL = "py-4 px-3 text-sm text-gray-500";

export const DataTable = <T extends Data>({
  data,
  columns,
  className,
  renderDetails,
  hasDetailsColumn,
  detailsButtonClassName,
  keyOf,
}: DataTableProps<T>): JSX.Element => {
  const Details = renderDetails;
  const [openDetails, setOpenDetails] = useState<OpenMap>({});

  const toggleDetails = useCallback((id: string) => {
    setOpenDetails((last) => {
      return {
        ...last,
        [id]: last[id as keyof typeof last] === true ? false : true,
      };
    });
  }, []);

  return (
    <table
      className={cx(
        "min-w-full divide-y divide-gray-300 table-fixed",
        className
      )}
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={c.name}
              scope="col"
              className={cx(DEFAULT_HEAD, c.headerClassName)}
            >
              {c.name}
            </th>
          ))}
          {!hasDetailsColumn ? null : <th className={cx(DEFAULT_HEAD)}></th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => {
          const rowkey = keyOf ? keyOf(row) : `index${idx}`;
          return (
            <React.Fragment key={rowkey}>
              <tr>
                {columns.map((c) => {
                  const colkey = `${rowkey}-${c.name}`;
                  return (
                    <td
                      key={colkey}
                      className={cx(DEFAULT_CELL, c.cellClassName)}
                      title={
                        c.title
                          ? c.title({ data: row, record: row })
                          : undefined
                      }
                    >
                      <c.renderValue data={row} record={row} />
                    </td>
                  );
                })}
                {!hasDetailsColumn ? null : (
                  <td>
                    <button
                      onClick={() => toggleDetails(rowkey)}
                      className={cx(detailsButtonClassName)}
                    >
                      details
                    </button>
                  </td>
                )}
              </tr>
              {openDetails[rowkey] !== true ||
              typeof Details === "undefined" ? null : (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <Details
                      data={row}
                      record={row}
                      close={() => toggleDetails(rowkey)}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};
