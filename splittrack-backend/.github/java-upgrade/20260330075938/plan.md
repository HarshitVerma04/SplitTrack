

# Upgrade Plan: splittrack-backend (20260330075938)

- **Generated**: 2026-03-30 07:59:38
- **HEAD Branch**: appmod/java-upgrade-20260329205435
- **HEAD Commit ID**: 869be6306bd014889182dbb8e63344ee1af4fb18

## Available Tools
**JDKs**
- JDK 23.0.1: C:\Program Files\Java\jdk-23\bin (used by step 2 baseline)
- JDK 25.0.2: C:\Users\harsh\.jdk\jdk-25\bin (used by steps 3-4 target runtime validation)

**Build Tools**
- Maven 3.9.14: C:\Program Files\Apache\maven\apache-maven-3.9.14-bin\bin (used by step 2 baseline)
- Maven 4.0.0-rc-5: C:\Users\harsh\.maven\apache-maven-4.0.0-rc-5\bin (installed in step 1 for Java 25 compatibility)
- Maven Wrapper: Not present



## Guidelines



- Upgrade Java runtime to the latest LTS release.

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred. 

## Options

- Working branch: appmod/java-upgrade-20260330075938 
- Run tests before and after the upgrade: true 

## Upgrade Goals



- Upgrade Java runtime from 23 to 25 (latest LTS)

### Technology Stack



| Technology/Dependency | Current | Min Compatible | Why Incompatible |
| --------------------- | ------- | -------------- | ---------------- |
| Java                  | 23      | 25             | User requested latest LTS runtime |
| Spring Boot           | 3.4.4   | 3.4.4          | - |
| Maven CLI             | 3.9.14  | 4.0.0          | Java 25 upgrade workflow requires Maven 4.0+ compatibility |
| Maven Wrapper         | Not present | N/A         | Project uses system Maven; no wrapper upgrade needed |
| maven-compiler-plugin | Managed by Spring Boot 3.4.4 | Managed version validated under Maven 4 + Java 25 | Effective release 25 compilation must be validated during upgrade |
| maven-surefire-plugin | Managed by Spring Boot 3.4.4 | Managed version validated under Maven 4 + Java 25 | Test execution compatibility with Java 25 must be validated |

### Derived Upgrades
- Upgrade Java runtime from 23 to 25 by changing project java.version property to 25 (explicit user goal).
- Upgrade Maven CLI from 3.9.14 to 4.0+ for Java 25 build compatibility required by this workflow.
- Validate and align Maven plugin execution (compiler and surefire managed by Spring Boot BOM) under Maven 4 + Java 25 during compile and test phases.



## Upgrade Steps
- Step 1: Setup Environment
  - **Rationale**: Ensure all required build tools for Java 25 are available before applying project changes.
  - **Changes to Make**:
    - [ ] Install latest Maven using tool-based installer and capture installed path
    - [ ] Verify JDK 25 path availability for execution steps
  - **Verification**:
    - Command: appmod-list-mavens and appmod-list-jdks
    - Expected: Maven 4.0+ available and JDK 25 available

- Step 2: Setup Baseline
  - **Rationale**: Establish pre-upgrade compile and test baseline using current Java 23 configuration.
  - **Changes to Make**:
    - [ ] Run baseline compilation including tests compilation
    - [ ] Run baseline test suite and record pass rate
  - **Verification**:
    - Command: mvn clean test-compile -q then mvn clean test -q
    - JDK: C:\Program Files\Java\jdk-23
    - Expected: Baseline compile status and baseline test pass rate documented

- Step 3: Upgrade Runtime Target to Java 25
  - **Rationale**: Apply the explicit user-requested runtime target change while keeping framework versions stable.
  - **Changes to Make**:
    - [ ] Update pom property java.version from 23 to 25
    - [ ] Use Maven 4.0+ with JDK 25 and fix any compile issues
    - [ ] Keep dependency changes minimal and only compatibility-driven
  - **Verification**:
    - Command: mvn clean test-compile -q
    - JDK: C:\Users\harsh\.jdk\jdk-25
    - Expected: Compilation success for main and test code

- Step 4: Final Validation
  - **Rationale**: Confirm all goals are met with Java 25 and no remaining regressions.
  - **Changes to Make**:
    - [ ] Verify Java target is 25 in pom.xml
    - [ ] Resolve all pending TODOs/workarounds from prior steps
    - [ ] Run full clean test cycle with Maven 4.0+ and JDK 25
    - [ ] Fix all remaining failures until 100% pass rate
  - **Verification**:
    - Command: mvn clean test -q
    - JDK: C:\Users\harsh\.jdk\jdk-25
    - Expected: Compilation success and 100% tests pass



## Key Challenges
- **Maven 4 Transition for Java 25**
  - **Challenge**: Existing Maven installations are 3.9.x, while this workflow requires Maven 4.0+ for Java 25.
  - **Strategy**: Install latest Maven in step 1 and run all Java 25 verification with that Maven path.

- **Compiler and Test Plugin Validation on New Runtime**
  - **Challenge**: Managed plugin versions must be validated under Java 25 to avoid compile or test runtime regressions.
  - **Strategy**: Use iterative compile and full-test validation after java.version update and fix issues immediately.



