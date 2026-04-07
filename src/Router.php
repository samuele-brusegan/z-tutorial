<?php

/**
 * Simple Router — inspired by actv-live
 */

class Router {
    private array $routes = [];

    /**
     * Add a route. $url supports placeholders like {id}
     */
    public function add(string $url, callable $handler): void {
        $this->routes[] = [
            'pattern' => preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', rtrim($url, '/') ?: '/'),
            'handler' => $handler,
        ];
    }

    /**
     * Dispatch the request. Returns true if a route matched.
     */
    public function dispatch(string $uri): bool {
        
        $path = rtrim(parse_url($uri, PHP_URL_PATH), '/');
        if ($path === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if (preg_match('#^' . $route['pattern'] . '$#', $path, $matches)) {
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                call_user_func($route['handler'], $params);
                return true;
            }
        }

        return false;
    }
}
