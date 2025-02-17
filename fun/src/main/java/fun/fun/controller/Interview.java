package fun.fun.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Interview {
    private static Map<String, List<String>> routes = new HashMap<>();
    public static void main(String[] args) {
        addRoute("a", "b");
        addRoute("a", "c");
        addRoute("b", "c");
        addRoute("b", "a");
        addRoute("b", "d");
        addRoute("c", "d");
        addRoute("c", "e");

        //a,d
        //abd
        //abcd
        //acd

        List<List<String>> paths = new ArrayList<>();
        List<String> path = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        path.add("a");
        visited.add("a");

        printRoutes("a", "d", path, visited, paths);
        paths.forEach(System.out::println);
    }

    private static void addRoute(String a, String b) {
        if (routes.containsKey(a)) {
            routes.get(a).add(b);
        } else {
            List<String> list = new ArrayList<>();
            list.add(b);
            routes.put(a, list);
        }
    }

    private static void printRoutes(String start, String end, List<String> path, Set<String> visited, List<List<String>> paths) {
        if (start.equals(end)) {
            paths.add(new ArrayList<>(path));
            return;
        }

        if (!routes.containsKey(start)) {
            return;
        }

        for (String node : routes.get(start)) {
            if (visited.contains(node)) {
                continue;
            }

            path.add(node);
            visited.add(node);
            printRoutes(node, end, path, visited, paths);
            path.remove(path.size() - 1);
            visited.remove(node);
        }
    }
}
