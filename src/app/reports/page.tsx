import type { Metadata } from "next"
import AppLayout from "../components/AppLayout"

export const metadata: Metadata = {
  title: "FLDSMDFR - Reportes",
  description: "Reportes",
}

export default function Dashboard() {
    return (
        <AppLayout>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
            Reportes
          </h1>
        </div>
      </AppLayout>
    )
}