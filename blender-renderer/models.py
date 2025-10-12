"""Data models and sample setups."""

from dataclasses import dataclass
from typing import List

@dataclass
class SetupOption:
    """Represents a chess position setup option"""
    name: str
    fen: str
    description: str = ""

# Matches ascii-chess-ts/src/models/SetupOptions.ts
SAMPLE_SETUPS: List[SetupOption] = [
    SetupOption(
        name="Standard Starting Position",
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        description="Standard chess starting position"
    ),
    SetupOption(
        name="King vs King",
        fen="rnbq1bnr/pppppppp/5k2/8/5K2/8/PPPPPPPP/RNBQ1BNR w KQkq - 0 1",
        description="King Box Demo - King vs King"
    ),
    SetupOption(
        name="Fool's Mate",
        fen="rnb1kbnr/pppp1ppp/4p3/8/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
        description="King Box Demo - Fool's Mate"
    ),
    SetupOption(
        name="Embedded Mate",
        fen="rnb4N/ppppk1pQ/8/2b5/2B5/8/PPP2nPP/RN4RK w - - 1 14",
        description="King Box Demo - Embedded Mate"
    ),
    SetupOption(
        name="Open Board Mate",
        fen="8/b7/4b3/6kp/3qBQ2/5K2/8/8 b - - 1 6",
        description="King Box Demo - Open Board Mate"
    ),
]
