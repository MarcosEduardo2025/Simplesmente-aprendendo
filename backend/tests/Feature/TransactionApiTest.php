<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TransactionApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_update_and_delete_their_transaction(): void
    {
        $user = User::factory()->create();
        $category = Category::create([
            'user_id' => $user->id,
            'name' => 'Salário',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', [
                'category_id' => $category->id,
                'description' => 'Pagamento mensal',
                'amount' => '1500.00',
                'date' => '2026-10-05',
                'type' => 'revenue',
            ])
            ->assertCreated()
            ->assertJsonPath('transaction.amount', '1500.00');

        $transaction = Transaction::firstOrFail();

        $this->putJson('/api/transactions/'.$transaction->id, [
            'category_id' => $category->id,
            'description' => 'Pagamento corrigido',
            'amount' => '1400.00',
            'date' => '2026-10-05',
            'type' => 'revenue',
        ])->assertOk()
            ->assertJsonPath('transaction.description', 'Pagamento corrigido');

        $this->deleteJson('/api/transactions/'.$transaction->id)
            ->assertNoContent();

        $this->assertDatabaseMissing('transactions', ['id' => $transaction->id]);
    }

    public function test_user_can_filter_paginate_and_summarize_only_their_transactions(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::create(['user_id' => $user->id, 'name' => 'Pessoal']);
        $otherCategory = Category::create(['user_id' => $otherUser->id, 'name' => 'Pessoal']);

        foreach (range(1, 15) as $number) {
            Transaction::create([
                'user_id' => $user->id,
                'category_id' => $category->id,
                'description' => 'Receita '.$number,
                'amount' => '10.00',
                'date' => '2026-10-05',
                'type' => 'revenue',
            ]);
        }

        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'description' => 'Despesa',
            'amount' => '5.00',
            'date' => '2026-10-05',
            'type' => 'expense',
        ]);
        Transaction::create([
            'user_id' => $user->id,
            'category_id' => $category->id,
            'description' => 'Mês anterior',
            'amount' => '100.00',
            'date' => '2026-09-05',
            'type' => 'revenue',
        ]);
        Transaction::create([
            'user_id' => $otherUser->id,
            'category_id' => $otherCategory->id,
            'description' => 'Outra conta',
            'amount' => '900.00',
            'date' => '2026-10-05',
            'type' => 'revenue',
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/transactions?month=10&year=2026')
            ->assertOk()
            ->assertJsonPath('total', 16)
            ->assertJsonPath('per_page', 15)
            ->assertJsonCount(15, 'data');

        $this->getJson('/api/dashboard/summary?month=10&year=2026')
            ->assertOk()
            ->assertExactJson([
                'total_revenue' => '150.00',
                'total_expenses' => '5.00',
                'balance' => '145.00',
            ]);
    }

    public function test_transaction_validation_rejects_non_positive_amounts_and_other_users_categories(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherCategory = Category::create([
            'user_id' => $otherUser->id,
            'name' => 'Privada',
        ]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/transactions', [
                'category_id' => $otherCategory->id,
                'description' => 'Inválida',
                'amount' => '0',
                'date' => '2026-10-05',
                'type' => 'expense',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'amount']);
    }

    public function test_user_cannot_update_or_delete_another_users_transaction(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create();
        $category = Category::create([
            'user_id' => $owner->id,
            'name' => 'Privada',
        ]);
        $transaction = Transaction::create([
            'user_id' => $owner->id,
            'category_id' => $category->id,
            'description' => 'Transação privada',
            'amount' => '25.00',
            'date' => '2026-10-05',
            'type' => 'expense',
        ]);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/transactions/'.$transaction->id, [
                'category_id' => $category->id,
                'description' => 'Alteração indevida',
                'amount' => '1.00',
                'date' => '2026-10-05',
                'type' => 'expense',
            ])
            ->assertNotFound();

        $this->deleteJson('/api/transactions/'.$transaction->id)
            ->assertNotFound();

        $this->assertDatabaseHas('transactions', [
            'id' => $transaction->id,
            'description' => 'Transação privada',
        ]);
    }
}
