generate_data <- function(expr, sd_Y, rho, n) {
  # Process the expression to ensure compatibility (not necessary if already in correct format)
  expr <- gsub("y\\s*=\\s*", "", expr, ignore.case = TRUE) # Remove 'y ='

  # Generate x values along the x axis
  x <- 1:n

  # Evaluate the expression with x to generate Y
  environment <- new.env()
  environment$x <- x
  Y <- eval(parse(text = expr), envir = environment)

  # Calculate the actual standard deviation of Y
  actual_sd_Y <- sd(Y)

  # Scale Y to have the desired standard deviation
  Y <- Y * (sd_Y / actual_sd_Y)

  # Adjust Y to have the desired correlation with x
  epsilon <- rnorm(n, mean = 0, sd = 1)
  Y <- rho * Y + sqrt(1 - rho^2) * epsilon * sd_Y

  # Scale the error component to maintain the desired standard deviation
  Y <- mean(Y) + (Y - mean(Y)) * (sd_Y / sd(Y))

  # Return a data frame with x and Y
  return(data.frame(x = x, Y = Y))
}

# Example usage
set.seed(123)
data <- generate_data("y = 3*x + 4", sd_Y = 0.5, rho = 0.75, n = 100)
print(cor(data$x, data$Y))
print(sd(data$Y))
print(head(data))
