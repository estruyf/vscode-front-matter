import * as React from "react"
import { cn } from "../../../utils/cn"

const VSCodeTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full text-base border-collapse indent-0 [&_tr:nth-child(2n)]:bg-[var(--vscode-keybindingTable-rowsBackground)]", className)}
      {...props}
    />
  </div>
))
VSCodeTable.displayName = "VSCodeTable"

const VSCodeTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b bg-[var(--vscode-keybindingTable-headerBackground)]", className)} {...props} />
))
VSCodeTableHeader.displayName = "VSCodeTableHeader"

const VSCodeTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
VSCodeTableBody.displayName = "VSCodeTableBody"

const VSCodeTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
VSCodeTableFooter.displayName = "VSCodeTableFooter"

const VSCodeTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-solid border-0 border-b border-b-[var(--vscode-editorGroup-border)] transition-colors [&_td]:border-r [&_td]:border-r-[var(--vscode-editorGroup-border)] [&_td:last-child]:border-r-0",
      className
    )}
    {...props}
  />
))
VSCodeTableRow.displayName = "VSCodeTableRow"

const VSCodeTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-6 px-2 py-2 text-left align-middle font-bold",
      className
    )}
    {...props}
  />
))
VSCodeTableHead.displayName = "VSCodeTableHead"

const VSCodeTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("border-solid border-0 h-6 px-2 overflow-hidden align-middle", className)}
    {...props}
  />
))
VSCodeTableCell.displayName = "VSCodeTableCell"

export {
  VSCodeTable,
  VSCodeTableHeader,
  VSCodeTableBody,
  VSCodeTableFooter,
  VSCodeTableHead,
  VSCodeTableRow,
  VSCodeTableCell,
}