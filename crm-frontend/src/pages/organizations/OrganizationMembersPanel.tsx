import * as React from "react"
import {
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Shield,
  UserMinus,
  UserPlus,
  Users2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  addCompanyMember,
  deactivateCompanyMember,
  listCompanyMembers,
  removeCompanyMember,
  updateCompanyMember,
  type CompanyMembership,
  type CompanyMembershipRole,
} from "./api"

type Props = {
  companyId: number | string
}

const roleOptions: CompanyMembershipRole[] = ["owner", "admin", "staff", "viewer"]

type MemberFormState = {
  email: string
  display_name: string
  job_title: string
  department: string
  work_email: string
  work_phone: string
  role: CompanyMembershipRole
  is_active: boolean
}

const emptyForm: MemberFormState = {
  email: "",
  display_name: "",
  job_title: "",
  department: "",
  work_email: "",
  work_phone: "",
  role: "staff",
  is_active: true,
}

function RoleBadge({ role }: { role: CompanyMembershipRole }) {
  const styles =
    role === "owner"
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : role === "admin"
      ? "border-sky-200 bg-sky-50 text-sky-700"
      : role === "staff"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700"

  return <Badge className={`rounded-full border ${styles}`}>{role}</Badge>
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      className={
        isActive
          ? "rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "rounded-full border border-slate-200 bg-slate-100 text-slate-600"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  )
}

function getMemberName(member: CompanyMembership) {
  const fullName = `${member.user_first_name || ""} ${member.user_last_name || ""}`.trim()
  return member.display_name || fullName || member.user_email
}

function matchesSearch(member: CompanyMembership, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    getMemberName(member),
    member.user_email,
    member.work_email || "",
    member.job_title || "",
    member.department || "",
    member.role,
    member.work_phone || "",
  ]
    .join(" ")
    .toLowerCase()

  return haystack.includes(q)
}

function buildEditForm(member: CompanyMembership): MemberFormState {
  return {
    email: member.user_email || "",
    display_name: member.display_name || "",
    job_title: member.job_title || "",
    department: member.department || "",
    work_email: member.work_email || "",
    work_phone: member.work_phone || "",
    role: member.role,
    is_active: member.is_active,
  }
}

type MemberModalProps = {
  mode: "create" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  value: MemberFormState
  onChange: React.Dispatch<React.SetStateAction<MemberFormState>>
  onSubmit: () => Promise<void>
  loading: boolean
  error: string | null
}

function MemberModal({
  mode,
  open,
  onOpenChange,
  value,
  onChange,
  onSubmit,
  loading,
  error,
}: MemberModalProps) {
  const title = mode === "create" ? "Add member" : "Update member"
  const description =
    mode === "create"
      ? "Invite someone into this organization and assign their initial role."
      : "Update member profile, workspace contact details, role, and access status."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-4 py-2 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Email</label>
            <Input
              value={value.email}
              onChange={(e) => onChange((v) => ({ ...v, email: e.target.value }))}
              placeholder="name@company.com"
              disabled={mode === "edit"}
              className="rounded-2xl"
            />
            {mode === "edit" ? (
              <p className="text-xs text-slate-500">
                Email is tied to the underlying user and cannot be changed here.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Display name</label>
            <Input
              value={value.display_name}
              onChange={(e) => onChange((v) => ({ ...v, display_name: e.target.value }))}
              placeholder="Jane Doe"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Job title</label>
            <Input
              value={value.job_title}
              onChange={(e) => onChange((v) => ({ ...v, job_title: e.target.value }))}
              placeholder="Operations Manager"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Department</label>
            <Input
              value={value.department}
              onChange={(e) => onChange((v) => ({ ...v, department: e.target.value }))}
              placeholder="Operations"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Work email</label>
            <Input
              value={value.work_email}
              onChange={(e) => onChange((v) => ({ ...v, work_email: e.target.value }))}
              placeholder="jane@company.com"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Work phone</label>
            <Input
              value={value.work_phone}
              onChange={(e) => onChange((v) => ({ ...v, work_phone: e.target.value }))}
              placeholder="+90 555 000 00 00"
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">Role</label>
            <Select
              value={value.role}
              onValueChange={(next) =>
                onChange((v) => ({ ...v, role: next as CompanyMembershipRole }))
              }
            >
              <SelectTrigger className="rounded-2xl">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "edit" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">Status</label>
              <Select
                value={value.is_active ? "active" : "inactive"}
                onValueChange={(next) =>
                  onChange((v) => ({ ...v, is_active: next === "active" }))
                }
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={loading || !value.email.trim()}
            className="rounded-2xl"
          >
            {loading
              ? mode === "create"
                ? "Adding..."
                : "Saving..."
              : mode === "create"
              ? "Add member"
              : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function OrganizationMembersPanel({ companyId }: Props) {
  const [members, setMembers] = React.useState<CompanyMembership[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"all" | CompanyMembershipRole>("all")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editOpen, setEditOpen] = React.useState(false)

  const [createForm, setCreateForm] = React.useState<MemberFormState>(emptyForm)
  const [editForm, setEditForm] = React.useState<MemberFormState>(emptyForm)
  const [selectedMember, setSelectedMember] = React.useState<CompanyMembership | null>(null)

  const [createError, setCreateError] = React.useState<string | null>(null)
  const [editError, setEditError] = React.useState<string | null>(null)

  const [createLoading, setCreateLoading] = React.useState(false)
  const [editLoading, setEditLoading] = React.useState(false)
  const [busyMemberId, setBusyMemberId] = React.useState<number | null>(null)

  const loadMembers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await listCompanyMembers(companyId)
      setMembers(data)
    } catch (err) {
      console.error(err)
      setError("Failed to load members.")
    } finally {
      setLoading(false)
    }
  }, [companyId])

  React.useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesRole = roleFilter === "all" ? true : member.role === roleFilter
      return matchesRole && matchesSearch(member, search)
    })
  }, [members, roleFilter, search])

  const openCreateModal = () => {
    setCreateError(null)
    setCreateForm(emptyForm)
    setCreateOpen(true)
  }

  const openEditModal = (member: CompanyMembership) => {
    setSelectedMember(member)
    setEditError(null)
    setEditForm(buildEditForm(member))
    setEditOpen(true)
  }

  const handleCreateMember = async () => {
    try {
      setCreateLoading(true)
      setCreateError(null)

      await addCompanyMember(companyId, {
        email: createForm.email.trim(),
        display_name: createForm.display_name.trim(),
        job_title: createForm.job_title.trim(),
        department: createForm.department.trim(),
        work_email: createForm.work_email.trim(),
        work_phone: createForm.work_phone.trim(),
        role: createForm.role,
      })

      setCreateOpen(false)
      setCreateForm(emptyForm)
      await loadMembers()
    } catch (err) {
      console.error(err)
      setCreateError("Failed to add member.")
    } finally {
      setCreateLoading(false)
    }
  }

  const handleUpdateMember = async () => {
    if (!selectedMember) return

    try {
      setEditLoading(true)
      setEditError(null)

      const updated = await updateCompanyMember(companyId, selectedMember.id, {
        display_name: editForm.display_name.trim(),
        job_title: editForm.job_title.trim(),
        department: editForm.department.trim(),
        work_email: editForm.work_email.trim(),
        work_phone: editForm.work_phone.trim(),
        role: editForm.role,
        is_active: editForm.is_active,
      })

      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
      setEditOpen(false)
      setSelectedMember(null)
    } catch (err) {
      console.error(err)
      setEditError("Failed to update member.")
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeactivate = async (member: CompanyMembership) => {
    try {
      setBusyMemberId(member.id)
      setError(null)
      await deactivateCompanyMember(companyId, member.id)
      await loadMembers()
    } catch (err) {
      console.error(err)
      setError("Failed to deactivate member.")
    } finally {
      setBusyMemberId(null)
    }
  }

  const handleRemove = async (member: CompanyMembership) => {
    try {
      setBusyMemberId(member.id)
      setError(null)
      await removeCompanyMember(companyId, member.id)
      await loadMembers()
    } catch (err) {
      console.error(err)
      setError("Failed to remove member.")
    } finally {
      setBusyMemberId(null)
    }
  }

  return (
    <>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-slate-700" />
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Members
              </h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Manage organization access with a clean admin table, modal editing,
              and controlled role updates.
            </p>
          </div>

          <Button onClick={openCreateModal} className="rounded-2xl">
            <UserPlus className="mr-2 h-4 w-4" />
            Add member
          </Button>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="rounded-2xl pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={roleFilter}
              onValueChange={(next) =>
                setRoleFilter(next as "all" | CompanyMembershipRole)
              }
            >
              <SelectTrigger className="w-[180px] rounded-2xl">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Badge className="rounded-full border border-slate-200 bg-slate-100 text-slate-700">
              {filteredMembers.length} shown
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Loading members...
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">
              <Users2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              No members found
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Try adjusting the filters or add a new member to this organization.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="pl-6">Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Work Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[72px] pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMembers.map((member) => {
                  const isBusy = busyMemberId === member.id

                  return (
                    <TableRow key={member.id} className="hover:bg-slate-50/70">
                      <TableCell className="pl-6">
                        <div className="min-w-0">
                          <div className="font-medium text-slate-900">
                            {getMemberName(member)}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <Mail className="h-3.5 w-3.5" />
                            <span className="truncate">{member.user_email}</span>
                          </div>
                          {member.job_title ? (
                            <div className="mt-1 text-xs text-slate-500">
                              {member.job_title}
                            </div>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell>
                        <RoleBadge role={member.role} />
                      </TableCell>

                      <TableCell className="text-slate-700">
                        {member.department || "—"}
                      </TableCell>

                      <TableCell className="text-slate-700">
                        {member.work_email || "—"}
                      </TableCell>

                      <TableCell>
                        {member.work_phone ? (
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{member.work_phone}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusBadge isActive={member.is_active} />
                      </TableCell>

                      <TableCell className="pr-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isBusy}
                              className="rounded-xl"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuItem onClick={() => openEditModal(member)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Edit member
                            </DropdownMenuItem>

                            {member.is_active ? (
                              <DropdownMenuItem onClick={() => handleDeactivate(member)}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => openEditModal(member)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Reactivate via edit
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onClick={() => handleRemove(member)}
                              className="text-rose-600 focus:text-rose-700"
                            >
                              Remove member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <MemberModal
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        value={createForm}
        onChange={setCreateForm}
        onSubmit={handleCreateMember}
        loading={createLoading}
        error={createError}
      />

      <MemberModal
        mode="edit"
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (!open) {
            setSelectedMember(null)
            setEditError(null)
          }
        }}
        value={editForm}
        onChange={setEditForm}
        onSubmit={handleUpdateMember}
        loading={editLoading}
        error={editError}
      />
    </>
  )
}