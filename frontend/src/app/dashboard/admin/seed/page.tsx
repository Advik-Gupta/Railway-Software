"use client";

import { useState } from "react";
import { Database, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { RequireRole } from "@/components/RequireRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface SeedResult {
  operatorsCreated: number;
  machinesCreated: number;
  testSitesCreated: number;
  pointsCreated: number;
}

export default function SeedPage() {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.get<SeedResult>("/seed/dev");
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Could not reach the server. Is it running?");
      }
    } finally {
      setSeeding(false);
    }
  }

  return (
    <RequireRole roles={["admin"]}>
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-xl font-semibold text-foreground">Seed Database</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Dev-only tool. Deletes all existing operators and creates 10 fresh
          ones, plus 5 machines with fully detailed test sites.
        </p>

        <Card className="mt-8 border-destructive/30 bg-destructive/5 p-5">
          <p className="text-sm font-medium text-destructive">
            This is destructive
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Every existing operator account will be permanently deleted and
            replaced. Admin, supervisor, machine in-charge, and fleet manager
            accounts are untouched.
          </p>
        </Card>

        <div className="mt-6">
          <Button onClick={handleSeed} disabled={seeding}>
            {seeding ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Seeding...
              </>
            ) : (
              <>
                <Database className="mr-2 size-4" />
                Seed Database
              </>
            )}
          </Button>
        </div>

        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <Card className="mt-6 border-green-500/30 bg-green-500/5 p-5">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="size-4" />
              <p className="text-sm font-medium">Seeding complete</p>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted-foreground">Operators created</dt>
              <dd className="text-foreground">{result.operatorsCreated}</dd>
              <dt className="text-muted-foreground">Machines created</dt>
              <dd className="text-foreground">{result.machinesCreated}</dd>
              <dt className="text-muted-foreground">Test sites created</dt>
              <dd className="text-foreground">{result.testSitesCreated}</dd>
              <dt className="text-muted-foreground">Points created</dt>
              <dd className="text-foreground">{result.pointsCreated}</dd>
            </dl>
          </Card>
        )}
      </div>
    </RequireRole>
  );
}
