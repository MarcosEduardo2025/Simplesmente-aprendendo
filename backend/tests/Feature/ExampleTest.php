<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_user_cannot_create_duplicate_category_name(): void
    {
        $user = User::factory()->create();

        Category::create([
            'user_id' => $user->id,
            'name' => 'Transporte',
        ]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/categories', [
            'name' => 'Transporte',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
