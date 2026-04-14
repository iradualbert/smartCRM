import { useMemo } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useOrganizations } from "@/redux/hooks/useOrganizations";

type Organization = {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
};

type OrganizationSwitcherProps = {
  value?: string | null;
  onChange?: (organization: Organization) => void;
};

const getOrgLabel = (org: Organization) =>
  org?.name || org?.title || org?.slug || "Untitled organization";

const getOrgId = (org: Organization) => org?.id || org?._id || getOrgLabel(org);

const OrganizationSwitcher = ({
  value,
  onChange,
}: OrganizationSwitcherProps) => {
  const navigate = useNavigate();
  const { organizations = [], defaultOrganization } = useOrganizations();

  const selectedOrg = useMemo(() => {
    if (!organizations.length) return null;
    return (
      organizations.find((org: Organization) => getOrgId(org) === value) ||
      defaultOrganization ||
      organizations[0]
    );
  }, [organizations, defaultOrganization, value]);

  if (!organizations.length) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 min-w-[220px] justify-between rounded-xl border-slate-200 bg-white px-3 text-sm font-medium shadow-sm hover:bg-slate-50"
        >
          <span className="flex items-center gap-2 truncate">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
              <Building2 className="h-4 w-4 text-slate-600" />
            </span>
            <span className="truncate">{getOrgLabel(selectedOrg)}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={10} className="z-[120] w-[320] rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl">
        <Command>
          <CommandInput placeholder="Search organizations..." />
          <CommandList>
            <CommandEmpty>No organization found.</CommandEmpty>
            <CommandGroup heading="Organizations">
              {organizations.map((org: Organization) => {
                const orgId = getOrgId(org);
                const isActive = getOrgId(selectedOrg) === orgId;

                return (
                  <CommandItem
                    key={orgId}
                    value={getOrgLabel(org)}
                    onSelect={() => {
                      onChange?.(org);

                      // optional route pattern:
                      // navigate(`/app/${org.slug || orgId}/dashboard`);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{getOrgLabel(org)}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-lg"
                onClick={() => navigate("/settings/organizations")}
              >
                Manage organizations
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default OrganizationSwitcher;