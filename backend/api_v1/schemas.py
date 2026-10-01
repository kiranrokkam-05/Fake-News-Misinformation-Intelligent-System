from pydantic import BaseModel, ConfigDict, Field, field_validator


class VerifyOptions(BaseModel):
    model_config = ConfigDict(extra="forbid")
    include_baseline: bool = False
    max_evidence: int = Field(default=5, ge=1, le=20)


class VerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    claim: str = Field(min_length=5, max_length=1000)
    options: VerifyOptions = Field(default_factory=VerifyOptions)

    @field_validator("claim")
    @classmethod
    def non_blank(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError("claim must contain at least 5 non-whitespace characters")
        return value


class BatchRequest(BaseModel):
    claims: list[VerifyRequest] = Field(min_length=1, max_length=10)


class ArticleRequest(BaseModel):
    text: str = Field(min_length=5, max_length=20_000)
