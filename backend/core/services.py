import numpy as np

# Compute payback period (years) for each grid cell, giving the prescription map its main data
def compute_payback_period_grid(
    yield_control: np.ndarray,
    yield_biochar: np.ndarray,
    crop_price: float,
    biochar_rate: float,
    biochar_price: float,
) -> np.ndarray:
    # yield_control and yield_biochar are 2D arrays representing the field's yield predictions
    # 1. Calculate yield difference per cell
    yield_delta = yield_biochar - yield_control

    # 2. Find marginal revenue per cell
    marginal_revenue = yield_delta * crop_price

    # 3. Find amendment cost to be used in payback period equation, configured for adjustable biochar application rate
    biochar_cost = biochar_rate * biochar_price

    # 4. Initialize payback period grid with infinity, making it easier to handle negative payback periods
    payback_period_grid = np.full(yield_delta.shape, np.inf, dtype="float32")

    # 5. Append payback period values to each cell, keep negative payback period values as positive infinity
    valid_payback_mask = marginal_revenue > 0
    payback_period_grid[valid_payback_mask] = biochar_cost / marginal_revenue[valid_payback_mask]

    return payback_period_grid

