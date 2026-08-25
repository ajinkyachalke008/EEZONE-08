declare module "nerdamer" {
  interface NerdamerExpression {
    toTeX(): string;
    toString(): string;
    valueOf(): string;
  }

  interface NerdamerFunction {
    (expr: string): NerdamerExpression;
    diff(expr: string, variable?: string): NerdamerExpression;
    integrate(expr: string, variable?: string): NerdamerExpression;
    defint(expr: string, lower: string, upper: string, variable?: string): NerdamerExpression;
    solve(expr: string, variable?: string): NerdamerExpression;
    expand(expr: string): NerdamerExpression;
    factor(expr: string): NerdamerExpression;
    sum?: (expr: string, variable: string, lower: string, upper: string) => NerdamerExpression;
  }

  const nerdamer: NerdamerFunction;
  export default nerdamer;
}

declare module "nerdamer/Calculus";
declare module "nerdamer/Algebra";
declare module "nerdamer/Solve";
