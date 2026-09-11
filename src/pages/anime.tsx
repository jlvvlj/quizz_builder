"use client"

import { useEffect, useMemo, useState } from 'react';
import LoadingState from '@/components/LoadingState'
import { useRouter } from 'next/router';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CircularProgress from '@/components/CircularProgress';
import { fetchAnimeList, type AnimeListItem } from '@/utils/anime-client';

type Row = AnimeListItem & { completion: number };

export default function AnimePage() {
    const router = useRouter();
    const [anime, setAnime] = useState<AnimeListItem[]>([]);
    const [progressMap, setProgressMap] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'completion', desc: true }]);
    const [view, setView] = useState<'table' | 'cards'>('table');

    useEffect(() => {
        fetchAnimeList()
            .then(list => {
                setAnime(list);
                list.forEach(a => {
                    fetch(`/api/anime/progress?animeId=${a.id}`, { credentials: 'include' })
                        .then(r => r.ok ? r.json() : Promise.reject(new Error('progress ' + r.status)))
                        .then(d => setProgressMap(m => ({ ...m, [a.id]: d.progress || 0 })))
                        .catch(err => console.error(`anime ${a.id} progress fetch failed:`, err));
                });
            })
            .catch(e => { console.error(e); setError('Failed to load anime list.'); })
            .finally(() => setLoading(false));
    }, []);

    // Re-derive table rows whenever anime list or progress changes so
    // the completion column sorts/filters against live values.
    const rows: Row[] = useMemo(
        () => anime.map(a => ({ ...a, completion: progressMap[a.id] ?? 0 })),
        [anime, progressMap]
    );

    const columns: ColumnDef<Row>[] = useMemo(() => [
        {
            accessorKey: 'title',
            header: 'Anime',
            cell: ({ row }) => (
                <button
                    onClick={() => router.push(`/anime/${row.original.id}`)}
                    className="text-left text-white hover:underline"
                >
                    {row.original.title}
                </button>
            ),
        },
        {
            accessorKey: 'episode_count',
            header: 'Episodes',
            cell: ({ row }) =>
                row.original.episode_count > 0
                    ? <span className="text-white">{row.original.episode_count}</span>
                    : <span className="text-[#A1A1A1]">Movie</span>,
        },
        { accessorKey: 'difficulty', header: 'Difficulty', cell: ({ row }) => <span className="text-white">{row.original.difficulty}</span> },
        { accessorKey: 'total_words', header: 'Total words', cell: ({ row }) => <span className="text-white">{row.original.total_words.toLocaleString()}</span> },
        { accessorKey: 'unique_words', header: 'Unique words', cell: ({ row }) => <span className="text-white">{row.original.unique_words.toLocaleString()}</span> },
        {
            accessorKey: 'completion',
            header: 'Completion',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <CircularProgress
                        progress={row.original.completion}
                        size={36}
                        strokeWidth={5}
                        showPercentage={false}
                        progressColor="#FF0054"
                        backgroundColor="#181818"
                    />
                    <span className="text-white tabular-nums">{row.original.completion}%</span>
                </div>
            ),
            sortingFn: 'basic',
        },
    ], [router]);

    const table = useReactTable({
        data: rows,
        columns,
        state: { globalFilter, sorting },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        globalFilterFn: (row, _columnId, filter) =>
            row.original.title.toLowerCase().includes(String(filter).toLowerCase()),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="min-h-screen bg-[#181818] flex flex-col">
            <div className="flex-1 px-3 py-4 sm:px-6 sm:py-8 xl:px-12">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">Anime</h1>
                        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                            {/* Pill view toggle */}
                            <div className="inline-flex rounded-full border border-[#4F4F4F] bg-[#262626] p-1 text-sm">
                                {(['table', 'cards'] as const).map(v => (
                                    <button
                                        key={v}
                                        type="button"
                                        onClick={() => setView(v)}
                                        className={
                                            'px-4 py-1.5 rounded-full transition-colors capitalize '
                                            + (view === v
                                                ? 'bg-[#FF0054] text-white'
                                                : 'text-[#A1A1A1] hover:text-white')
                                        }
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                            {/* Sort selector — same state as the table header sort */}
                            <Select
                                value={`${sorting[0]?.id ?? 'completion'}:${sorting[0]?.desc ? 'desc' : 'asc'}`}
                                onValueChange={(v) => {
                                    const [id, dir] = v.split(':');
                                    setSorting([{ id, desc: dir === 'desc' }]);
                                }}
                            >
                                <SelectTrigger className="w-[200px] bg-[#262626] border-[#4F4F4F] text-white">
                                    <SelectValue placeholder="Sort by…" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completion:desc">Completion (most)</SelectItem>
                                    <SelectItem value="completion:asc">Completion (least)</SelectItem>
                                    <SelectItem value="title:asc">Title (A → Z)</SelectItem>
                                    <SelectItem value="title:desc">Title (Z → A)</SelectItem>
                                    <SelectItem value="difficulty:asc">Difficulty (easiest)</SelectItem>
                                    <SelectItem value="difficulty:desc">Difficulty (hardest)</SelectItem>
                                    <SelectItem value="episode_count:desc">Episodes (most)</SelectItem>
                                    <SelectItem value="episode_count:asc">Episodes (fewest)</SelectItem>
                                    <SelectItem value="total_words:desc">Total words (most)</SelectItem>
                                    <SelectItem value="unique_words:desc">Unique words (most)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                                placeholder="Search anime by title…"
                                className="sm:max-w-xs"
                            />
                        </div>
                    </div>

                    {loading && <LoadingState text="Loading anime" />}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && view === 'cards' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                            {table.getRowModel().rows.length === 0 ? (
                                <p className="text-[#A1A1A1] col-span-full">No anime match this search.</p>
                            ) : table.getRowModel().rows.map(r => {
                                const a = r.original;
                                return (
                                    <div
                                        key={a.id}
                                        onClick={() => router.push(`/anime/${a.id}`)}
                                        className="bg-[#262626] border border-[#4F4F4F] rounded-lg p-4 sm:p-6 cursor-pointer hover:bg-[#2F2F2F] transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2 truncate">{a.title}</h3>
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">
                                                    {a.episode_count > 0 ? `${a.episode_count} episodes` : 'Movie / special'}
                                                </p>
                                                <p className="text-[#A1A1A1] text-sm sm:text-base">Difficulty {a.difficulty}</p>
                                            </div>
                                            <div className="shrink-0">
                                                <CircularProgress
                                                    progress={a.completion}
                                                    size={50}
                                                    strokeWidth={6}
                                                    progressColor="#FF0054"
                                                    backgroundColor="#181818"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!loading && !error && view === 'table' && (
                        <div className="bg-[#262626] border border-[#4F4F4F] rounded-lg">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map(hg => (
                                        <TableRow key={hg.id}>
                                            {hg.headers.map(h => {
                                                const canSort = h.column.getCanSort();
                                                const sorted = h.column.getIsSorted();
                                                return (
                                                    <TableHead key={h.id}>
                                                        {canSort ? (
                                                            <button
                                                                onClick={h.column.getToggleSortingHandler()}
                                                                className="inline-flex items-center gap-1 hover:text-white"
                                                            >
                                                                {flexRender(h.column.columnDef.header, h.getContext())}
                                                                {sorted === 'asc'
                                                                    ? <ArrowUp className="h-3.5 w-3.5" />
                                                                    : sorted === 'desc'
                                                                        ? <ArrowDown className="h-3.5 w-3.5" />
                                                                        : <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />}
                                                            </button>
                                                        ) : flexRender(h.column.columnDef.header, h.getContext())}
                                                    </TableHead>
                                                );
                                            })}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="text-center text-[#A1A1A1]">
                                                No anime match this search.
                                            </TableCell>
                                        </TableRow>
                                    ) : table.getRowModel().rows.map(r => (
                                        <TableRow
                                            key={r.id}
                                            onClick={() => router.push(`/anime/${r.original.id}`)}
                                            className="cursor-pointer"
                                        >
                                            {r.getVisibleCells().map(c => (
                                                <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
