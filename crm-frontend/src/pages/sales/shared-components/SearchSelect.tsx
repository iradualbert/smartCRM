import * as React from "react"
import { ChevronsUpDown, Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type SearchSelectProps<T> = {
  valueLabel?: string | null
  placeholder: string
  searchPlaceholder: string
  items: T[]
  open: boolean
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  disabled?: boolean
  emptyMessage?: string
  onOpenChange: (open: boolean) => void
  onSearch: (term: string) => void
  onSelect: (item: T) => void
  onLoadMore?: () => void
  getKey: (item: T) => string | number
  getLabel: (item: T) => string
  getDescription?: (item: T) => string | null | undefined
  renderFooter?: React.ReactNode
}

export default function SearchSelect<T>({
  valueLabel,
  placeholder,
  searchPlaceholder,
  items,
  open,
  loading = false,
  loadingMore = false,
  hasMore = false,
  disabled = false,
  emptyMessage = "No results found.",
  onOpenChange,
  onSearch,
  onSelect,
  onLoadMore,
  getKey,
  getLabel,
  getDescription,
  renderFooter,
}: SearchSelectProps<T>) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-11 w-full justify-between rounded-2xl border-slate-200 bg-white"
        >
          <span className="truncate text-left">
            {valueLabel?.trim() ? valueLabel : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[420px] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          <CommandList>
            <CommandEmpty>
              {loading ? "Searching..." : emptyMessage}
            </CommandEmpty>

            <CommandGroup>
              {items.map((item) => {
                const label = getLabel(item)
                const description = getDescription?.(item)

                return (
                  <CommandItem
                    key={getKey(item)}
                    value={label}
                    onSelect={() => {
                      onSelect(item)
                      onOpenChange(false)
                    }}
                    className="items-start py-2"
                  >
                    <div className="min-w-0">
                      <div className="truncate">{label}</div>
                      {description ? (
                        <div className="truncate text-xs text-slate-500">
                          {description}
                        </div>
                      ) : null}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>

            {hasMore && onLoadMore ? (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start rounded-xl"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading more
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Load more results
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            {renderFooter ? <div className="border-t p-2">{renderFooter}</div> : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
