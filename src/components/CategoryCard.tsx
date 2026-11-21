import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

interface CategoryCardProps {
  number: string;
  name: string;
}

function CategoryCard({ number, name }: CategoryCardProps) {
  return (
    <Link
      to={`/shop?category=${encodeURIComponent(name)}`}
      className="category-item"
    >
      <span>{number}</span>

      <div className="category-bottom">
        <h3>{name}</h3>
        <ArrowUpRight />
      </div>
    </Link>
  );
}

export default CategoryCard;