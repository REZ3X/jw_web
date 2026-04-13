"use client";

/**
 * Empty state component.
 */

import { cn } from "@/lib/utils";
import { HiOutlineInbox } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  const DefaultIcon = Icon || HiOutlineInbox;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col items-center justify-center py-14 px-4 text-center", className)}
    >
      <div className="w-14 h-14 rounded-xl bg-jw-secondary/15 border border-border-subtle flex items-center justify-center mb-3">
        <DefaultIcon className="w-7 h-7 text-jw-accent" />
      </div>
      {title && <h3 className="text-base font-semibold text-text-primary mb-0.5">{title}</h3>}
      {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
