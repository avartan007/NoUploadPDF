require "minitest/autorun"
require_relative "../../app/models/tool_catalog"

class ToolCatalogTest < Minitest::Test
  def test_has_all_28_tools
    assert_equal 28, ToolCatalog.count
  end

  def test_category_counts_match_design_brief
    assert_equal 11, ToolCatalog.by_category("Organize").size
    assert_equal 6, ToolCatalog.by_category("Convert").size
    assert_equal 6, ToolCatalog.by_category("Edit").size
    assert_equal 5, ToolCatalog.by_category("Optimize").size
  end

  def test_lookup_by_id_and_seo_slug
    merge_by_id = ToolCatalog.find("merge")
    merge_by_slug = ToolCatalog.find("merge-pdf")
    assert_equal "01", merge_by_id[:num]
    assert_equal merge_by_id[:id], merge_by_slug[:id]
  end
end
