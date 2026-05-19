import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/constants/enums";

type AppRole = "USER" | "ADMIN" | "DELIVERY";

type EditUserFormProps = {
  title: string;
  description: string;
  helperText?: string;
  actionLabel?: string;
  labels?: {
    name: string;
    email: string;
    role: string;
  };
  user: {
    name?: string | null;
    email?: string | null;
    role: AppRole;
  };
};

/**
 * Shared user details form used by profile and admin pages.
 * This keeps the user info UI in one reusable place.
 */
const EditUserForm = ({
  title,
  description,
  helperText = "Read-only account snapshot",
  actionLabel = "Save Changes (coming soon)",
  labels = {
    name: "Name",
    email: "Email",
    role: "Role",
  },
  user,
}: EditUserFormProps) => {
  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border-b bg-linear-to-br from-primary/10 via-background to-secondary/20 p-6 md:p-8 lg:border-b-0 lg:border-r">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            {isAdmin ? "Management" : "Account"}
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
            {description}
          </p>

          <div className="mt-6 space-y-3 rounded-2xl border bg-background/80 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {labels.role}
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {user.role}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Status
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin
                  ? "Administrative access is active for this account."
                  : "Profile access is active for this customer account."}
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">{helperText}</p>
        </div>

        <div className="p-6 md:p-8">
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{labels.name}</Label>
              <Input id="name" defaultValue={user.name ?? ""} readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">{labels.email}</Label>
              <Input id="email" defaultValue={user.email ?? ""} readOnly />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">{labels.role}</Label>
              <Input id="role" defaultValue={user.role} readOnly />
            </div>

            <div className="rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground">
              {isAdmin
                ? "Admin changes are still managed through the dedicated management screens."
                : "Profile edits are disabled in this view until the update flow is connected."}
            </div>

            <Button type="button" className="mt-2 w-full sm:w-fit" disabled>
              {actionLabel}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EditUserForm;
