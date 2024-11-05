module NetworkX
  class DiGraph
    def is_directed_acyclic_graph?
      visited = Set.new
      temp = Set.new

      nodes.each do |node|
        next if visited.include?(node)
        return false if has_cycle?(node, visited, temp)
      end
      true
    end

    private

    def has_cycle?(node, visited, temp)
      return true if temp.include?(node)
      return false if visited.include?(node)

      temp.add(node)
      adj[node].keys.each do |neighbor|
        return true if has_cycle?(neighbor, visited, temp)
      end
      temp.delete(node)
      visited.add(node)
      false
    end
  end
end
