<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $name = trim((string) $request->input('name'));
        $request->merge(['name' => $name]);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
                Rule::unique('categories', 'name')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
        ]);

        $category = Category::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
        ]);

        return response()->json([
            'category' => $category,
        ], 201);
    }

    public function index(Request $request)
    {
        $categories = Category::where('user_id', $request->user()->id)->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }
}
