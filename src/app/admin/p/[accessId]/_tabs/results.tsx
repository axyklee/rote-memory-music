import ResultsTable from "@/app/admin/_components/resultsTable";

export default function ResultsTab({ accessId }: { accessId: string }) {
    return (
        <ResultsTable accessId={accessId} />
    );
}