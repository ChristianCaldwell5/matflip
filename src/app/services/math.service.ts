import { Injectable } from '@angular/core';
import { MathProblems } from '../model/enum/math.enums';
import { MathProblem } from '../model/interfaces/mathProblem';

@Injectable({
  providedIn: 'root'
})
export class MathService {

  // Math problems configuration
  private easyConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 10,
    problemTypes: [MathProblems.ADDSUB],
    negativesAllowed: false
  };

  private mediumConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 15,
    problemTypes: [MathProblems.ADDSUB, MathProblems.MULTDIV],
    negativesAllowed: true
  };

  private hardConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 20,
    problemTypes: [MathProblems.ADDSUB, MathProblems.MULTDIV, MathProblems.ALGEBRA],
    negativesAllowed: true
  };

  private masteryConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 50,
    problemTypes: [MathProblems.ADDSUB, MathProblems.MULTDIV, MathProblems.ALGEBRA, MathProblems.CALCULUS],
    negativesAllowed: true
  };

  constructor() { }

  generateMathProblem(difficulty: string): MathProblem {
    const config = this.getMathConfig(difficulty);
    const { minGenNum, maxGenNum, problemTypes, negativesAllowed } = config;

    // Generate a random number within the specified range
    const num1 = this.getRandomInt(minGenNum, maxGenNum, negativesAllowed);
    const num2 = this.getRandomInt(minGenNum, maxGenNum, negativesAllowed);

    // Select a random problem type
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];

    // Create the math problem based on the selected type
    let problem!: MathProblem;
    switch (problemType) {
      case MathProblems.ADDSUB:
        problem = this.generateAdditionSubtractionProblem(num1, num2);
        break;
      case MathProblems.MULTDIV:
        problem = this.generateMultiplicationDivisionProblem(num1, num2);
        break;
      case MathProblems.ALGEBRA:
        // Implement algebra problems here
        break;
      case MathProblems.CALCULUS:
        // Implement calculus problems here
        break;
      default:
        throw new Error('Invalid math problem type');
    }

    return problem;
  }

  /**
   * Generate a random integer between min and max (inclusive).
   * @param min Minimum value.
   * @param max Maximum value.
   * @param negativesAllowed Whether to allow negative numbers.
   * @returns Random integer between min and max.
   */
  private getRandomInt(min: number, max: number, negativesAllowed: boolean): number {
    let num: number = Math.floor(Math.random() * (max - min + 1)) + min;
    if (negativesAllowed && Math.random() < 0.4) {
      num *= -1;
    }
    return num;
  }

  /**
   * Generate an addition or subtraction problem.
   * @param num1 First number.
   * @param num2 Second number.
   * @returns The generated math problem.
   */
  private generateAdditionSubtractionProblem(num1: number, num2: number): MathProblem {
    const operator = Math.random() < 0.5 ? '+' : '-';
    let prob!: MathProblem;
    if (operator === '+') {
      prob.solution = num1 + num2;
    } else {
      prob.solution = num1 - num2;
    }
    prob.display = `${num1} ${operator} ${num2}`;
    return prob;
  }

  /**
   * Generate a multiplication or division problem.
   * @param num1 First number.
   * @param num2 Second number.
   * @returns The generated math problem.
   */
  private generateMultiplicationDivisionProblem(num1: number, num2: number): MathProblem {
    const operator = Math.random() < 0.5 ? '*' : '/';
    let prob!: MathProblem;
    if (operator === '*') {
      prob.solution = num1 * num2;
    } else {
      // Ensure that num1 is divisible by num2 for division problems
      if (num2 === 0) {
        num2 = 1; // Avoid division by zero
      }
      prob.solution = num1 / num2;
    }
    prob.display = `${num1} ${operator} ${num2}`;
    return prob;
  }

  /**
   * Generate an algebra problem.
   * @param num1 First number.
   * @param num2 Second number.
   * @returns The generated math problem.
   */
  private generateAlgebraProblem(num1: number, num2: number): MathProblem {
    // Implement algebra problem generation logic here
    return { display: '', solution: 0 }; // Placeholder
  }

  /**
   * Generate a calculus problem.
   * @param num1 First number.
   * @param num2 Second number.
   * @returns The generated math problem.
   */
  private generateCalculusProblem(num1: number, num2: number): MathProblem {
    // Implement calculus problem generation logic here
    return { display: '', solution: 0 }; // Placeholder
  }

  /**
   * Get the math configuration based on the selected difficulty level.
   * @param difficulty The difficulty level selected by the user.
   * @returns The corresponding math configuration.
   */
  private getMathConfig(difficulty: string): MathConfig {
    switch (difficulty) {
      case 'easy':
        return this.easyConfig;
      case 'medium':
        return this.mediumConfig;
      case 'hard':
        return this.hardConfig;
      case 'mastery':
        return this.masteryConfig;
      default:
        throw new Error('Invalid difficulty level');
    }
  }
}

interface MathConfig {
  minGenNum: number;
  maxGenNum: number;
  problemTypes: MathProblems[];
  negativesAllowed: boolean;
}
