from sqlalchemy.orm import Session

from app.modules.benchmark import models
from app.modules.benchmark.schemas import RuleCreate, BenchmarkCreate


def save_to_db(
    benchmark_info: BenchmarkCreate, parsed_rules: list[RuleCreate], db: Session
):
    try:
        db_benchmark = models.Benchmark(
            title=benchmark_info.title,
            version=benchmark_info.version,
            description=benchmark_info.description,
            name=benchmark_info.name,
            profile=benchmark_info.profile,
            labels=benchmark_info.labels,
            benchmark_refs=benchmark_info.benchmark_refs,
        )
        db.add(db_benchmark)
        db.flush()  # flush to get benchmark id

        db_rules = []
        for rule_schema in parsed_rules:
            db_rule = models.Rule(
                benchmark_id=db_benchmark.id, **rule_schema.model_dump()
            )
            db_rules.append(db_rule)

        db.add_all(db_rules)
        db.commit()
        db.refresh(db_benchmark)
        print(
            f"Successfully saved {len(db_rules)} rules to database under benchmark: {benchmark_info.title}"
        )
        return db_benchmark
    except Exception as e:
        db.rollback()
        print(f"Error saving to db: {e}")
        raise e
