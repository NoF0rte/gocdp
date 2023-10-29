package gocdp

import (
	"bufio"
	"bytes"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var (
	gbResultRegex *regexp.Regexp = regexp.MustCompile(`\s*(?P<url>https?://[^\s]+)\s*\(Status:\s*(?P<status>[0-9]+)\)\s*\[Size:\s*(?P<length>[0-9]+)\](?:\s*\[-->\s*(?P<redirect>[^\s]+)\s*])?`)
)

type GobusterParser struct {
}

func (GobusterParser) Parse(input string) (CDResults, error) {
	var results CDResults

	scanner := bufio.NewScanner(strings.NewReader(input))
	for scanner.Scan() {
		line := scanner.Text()

		match := gbResultRegex.FindStringSubmatch(line)
		if len(match) == 0 {
			continue
		}

		namedMatches := make(map[string]string)
		for j, name := range gbResultRegex.SubexpNames() {
			if j != 0 && name != "" {
				namedMatches[name] = match[j]
			}
		}

		status, _ := strconv.Atoi(namedMatches["status"])
		length, _ := strconv.Atoi(namedMatches["length"])

		result := CDResult{
			Url:           namedMatches["url"],
			Status:        status,
			ContentLength: length,
			ContentType:   "",
			source:        line,
		}

		if result.IsRedirect() {
			result.Redirect = namedMatches["redirect"]
		}

		results = append(results, result)
	}

	return results, nil
}

func (GobusterParser) CanParse(input string) bool {
	return gbResultRegex.MatchString(input)
}

func (GobusterParser) CanTransform() bool {
	return true
}

func (p GobusterParser) Transform(input string, filtered []interface{}) (string, error) {
	writer := bytes.NewBuffer(nil)

	for _, line := range filtered {
		writer.WriteString(fmt.Sprintln(line))
	}

	return writer.String(), nil
}
