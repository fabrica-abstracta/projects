import type { Status } from "../config/fetch";

type RequestStateProps = {
  status: Status;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  error?: React.ReactNode;
};

export const RequestState = ({
  status,
  children,
  skeleton = <DefaultSkeleton />,
  error = <DefaultError />,
}: RequestStateProps) => {
  if (status === "loading") return <>{skeleton}</>;

  if (status === "error") return <>{error}</>;

  return <>{children}</>;
};

const DefaultSkeleton = () => {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 h-4 w-28 rounded bg-slate-200" />
      <div className="mb-3 h-8 w-20 rounded bg-slate-200" />
      <div className="h-3 w-36 rounded bg-slate-200" />
    </div>
  );
};

const DefaultError = () => {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-600">
      No se pudo cargar la información.
    </div>
  );
};

// Badge

export type BadgeValue = {
  label: React.ReactNode;
  background: string;
  color: string;
};

type BadgeProps = {
  badge: BadgeValue;
  className?: string;
};

export function Badge({
  badge,
  className = "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide",
}: BadgeProps) {
  return (
    <span
      style={{
        backgroundColor: badge.background,
        color: badge.color,
      }}
      className={className}
    >
      {badge.label}
    </span>
  );
}

export function getBadge(badges: Record<string, BadgeValue>, id: string) {
  return badges[id];
}

// Modal

import { motion } from "framer-motion";
import { X } from "lucide-react";

type ModalSize = "sm" | "md" | "lg" | "xl";
type SidebarSide = "left" | "right";
type SidebarSize = "sm" | "md" | "lg" | "xl";

const modalSizes: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

const sidebarSizes: Record<SidebarSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  close,
  header,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}: {
  close: () => void;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnBackdrop?: boolean;
}) {
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-[#11151C]/55 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onMouseDown={closeOnBackdrop ? close : undefined}
    >
      <motion.div
        className={`relative flex max-h-[calc(100dvh-2rem)] w-full ${modalSizes[size]} flex-col overflow-hidden rounded-3xl bg-white shadow-2xl`}
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          <X className="h-5 w-5" />
        </button>

        {header && (
          <div className="shrink-0 border-b border-slate-100 px-6 py-5 pr-16">
            {header}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex w-full shrink-0 flex-col items-center gap-3 border-t border-slate-100 px-6 py-5">
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function Sidebar({
  close,
  header,
  children,
  footer,
  side = "right",
  size = "md",
  closeOnBackdrop = true,
}: {
  close: () => void;
  header?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: SidebarSide;
  size?: SidebarSize;
  closeOnBackdrop?: boolean;
}) {
  const isRight = side === "right";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#11151C]/55 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      onMouseDown={closeOnBackdrop ? close : undefined}
    >
      <motion.aside
        className={`fixed top-0 bottom-0 ${
          isRight ? "right-0" : "left-0"
        } flex h-dvh w-[86%] ${sidebarSizes[size]} flex-col overflow-hidden bg-white shadow-2xl`}
        initial={{ x: isRight ? "100%" : "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: isRight ? "100%" : "-100%" }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#11151C]"
        >
          <X className="h-5 w-5" />
        </button>

        {header && (
          <div className="shrink-0 border-b border-slate-100 px-6 py-5 pr-16">
            {header}
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-slate-100 px-6 py-5">
            <div className="grid gap-3">{footer}</div>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}
