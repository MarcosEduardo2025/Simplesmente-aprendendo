<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'service' => 'Financas Jr API',
        'status' => 'ok',
    ]);
});
