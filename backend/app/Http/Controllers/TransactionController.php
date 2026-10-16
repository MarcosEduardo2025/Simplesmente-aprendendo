<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->validatedFilters($request);

        $transactions = $this->applyFilters(
            $request->user()->transactions()->getQuery()->with('category'),
            $filters
        )->orderByDesc('date')->orderByDesc('id')->paginate(15);

        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $transaction = $request->user()->transactions()->create(
            $request->validate($this->transactionRules($request))
        );

        return response()->json([
            'transaction' => $transaction->load('category'),
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $transaction = $request->user()->transactions()->findOrFail($id);
        $transaction->update($request->validate($this->transactionRules($request)));

        return response()->json([
            'transaction' => $transaction->load('category'),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        $request->user()->transactions()->findOrFail($id)->delete();

        return response()->noContent();
    }

    public function summary(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $summary = $this->applyFilters(
            $request->user()->transactions()->getQuery(),
            $filters
        )->selectRaw(
            'COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0.00 END), 0.00) AS total_revenue,
             COALESCE(SUM(CASE WHEN type = ? THEN amount ELSE 0.00 END), 0.00) AS total_expenses,
             COALESCE(SUM(CASE WHEN type = ? THEN amount WHEN type = ? THEN -amount ELSE 0.00 END), 0.00) AS balance',
            ['revenue', 'expense', 'revenue', 'expense']
        )->first();

        return response()->json([
            'total_revenue' => $this->formatAmount($summary->total_revenue),
            'total_expenses' => $this->formatAmount($summary->total_expenses),
            'balance' => $this->formatAmount($summary->balance),
        ]);
    }

    private function transactionRules(Request $request): array
    {
        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn ($query) => $query->where('user_id', $request->user()->id)
                ),
            ],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'date' => ['required', 'date'],
            'type' => ['required', Rule::in(['revenue', 'expense'])],
        ];
    }

    private function validatedFilters(Request $request): array
    {
        return $request->validate([
            'month' => ['sometimes', 'integer', 'between:1,12'],
            'year' => ['sometimes', 'integer', 'digits:4'],
        ]);
    }

    private function applyFilters(Builder $query, array $filters): Builder
    {
        if (isset($filters['month'])) {
            $query->whereMonth('date', $filters['month']);
        }

        if (isset($filters['year'])) {
            $query->whereYear('date', $filters['year']);
        }

        return $query;
    }

    private function formatAmount(string|int|float|null $amount): string
    {
        [$integer, $fraction] = array_pad(explode('.', (string) ($amount ?? '0'), 2), 2, '');

        return $integer.'.'.str_pad(substr($fraction, 0, 2), 2, '0');
    }
}
