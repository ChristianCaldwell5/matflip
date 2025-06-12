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
    problemTypes: [MathProblems.ADDSUB],
    negativesAllowed: true
  };

  private hardConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 20,
    problemTypes: [MathProblems.ADDSUB, MathProblems.MULTDIV],
    negativesAllowed: true
  };

  private masteryConfig: MathConfig = {
    minGenNum: 1,
    maxGenNum: 50,
    problemTypes: [MathProblems.ADDSUB, MathProblems.MULTDIV],
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
        problem = this.generateAdditionSubtractionProblem(num1, num2, negativesAllowed);
        break;
      case MathProblems.MULTDIV:
        problem = this.generateMultiplicationDivisionProblem(num1, num2);
        break;
      default:
        throw new Error('Invalid math problem type');
    }

    return problem;
  }

  generateWrongSolution(correctSolution: number, difficulty: string): string {
    let config = this.getMathConfig(difficulty);
    const { negativesAllowed, maxGenNum } = config;
    let wrongSolution = correctSolution;
    const randomNumber = Math.floor(Math.random() * maxGenNum) + 1; // Random number between 1 and MaxGenNum
    const operator = Math.random() < 0.5 ? '+' : '-'; // Randomly choose between addition and subtraction

    if (operator === '+') {
      wrongSolution = correctSolution + randomNumber;
    } else {
      wrongSolution = correctSolution - randomNumber;
      // if negatives are not allowed, ensure the result is non-negative
      if (!negativesAllowed && wrongSolution < 0) {
        // Swap numbers to ensure a non-negative result
        wrongSolution = randomNumber - correctSolution
      }
    }

    return wrongSolution.toString();
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
  private generateAdditionSubtractionProblem(num1: number, num2: number, negativesAllowed: boolean): MathProblem {
    const operator = Math.random() < 0.5 ? '+' : '-';
    let prob: MathProblem = { display: '', solution: 0 };
    if (operator === '+') {
      prob.solution = num1 + num2;
    } else {
      prob.solution = num1 - num2;
    }

    // if negatives are not allowed, ensure the result is non-negative
    if (!negativesAllowed && prob.solution < 0) {
      // Swap numbers to ensure a non-negative result
      let temp = num1;
      num1 = num2;
      num2 = temp;
      prob.solution = num1 - num2; // Recalculate the solution
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
    let prob: MathProblem = { display: '', solution: 0 };
    if (operator === '*') {
      prob.solution = num1 * num2;
    } else {
      // Ensure that num1 is divisible by num2 for division problems
      if (num2 === 0) {
        num2 = 1; // Avoid division by zero
      }
      prob.solution = parseFloat((Math.round((num1 / num2) * 100)/100).toFixed(2)); // Round to two decimal places
    }
    prob.display = `${num1} ${operator} ${num2}`;
    return prob;
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
