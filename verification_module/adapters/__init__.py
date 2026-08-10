from verification_module.adapters.factcheck_adapter import FactCheckAdapter
from verification_module.adapters.gnews_adapter import GNewsAdapter
from verification_module.adapters.google_cse_adapter import GoogleCSEAdapter
from verification_module.adapters.newsapi_adapter import NewsAPIAdapter
from verification_module.adapters.wikipedia_adapter import WikipediaAdapter

# Every adapter the pipeline knows about. Add a new provider by
# writing a SearchAdapter subclass and appending it here -- nothing
# else in the pipeline needs to change.
ALL_ADAPTERS = [
    WikipediaAdapter(),
    NewsAPIAdapter(),
    GNewsAdapter(),
    GoogleCSEAdapter(),
    FactCheckAdapter(),
]
