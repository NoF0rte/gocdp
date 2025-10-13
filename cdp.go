package gocdp

import (
	"errors"
	"fmt"
	"io"
	"os"
)

var c *CDP
var errNoParser = errors.New("no parser found")

var defaultParsers = []Parser{
	FfufParser{},
	GobusterParser{},
	DirbParser{},
	FeroxbusterParser{},
	DirSearchParser{},
}

type Option func(*CDP)

// FailNoParserErrs will enable failing when no parser is found when parsing multiple files
func FailNoParserErrs() Option {
	return func(c *CDP) {
		c.failNoParserErr = true
	}
}

// DefaultParsers sets the default parsers used when no parser is specified
func DefaultParsers(parsers ...Parser) Option {
	return func(c *CDP) {
		c.defaultParsers = parsers
	}
}

type CDP struct {
	defaultParsers  []Parser
	failNoParserErr bool
}

func New(options ...Option) *CDP {
	cdp := &CDP{}
	for _, option := range options {
		option(cdp)
	}

	if len(cdp.defaultParsers) == 0 {
		cdp.defaultParsers = defaultParsers
	}

	return cdp
}

func (cdp *CDP) SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	var allResults CDResults
	for _, file := range files {
		results, err := cdp.SmartParseFile(file, parsers...)
		if err != nil {
			if err == errNoParser {
				if cdp.failNoParserErr {
					return nil, fmt.Errorf("no parser found for file '%s'", file)
				}
				continue
			}
			return nil, err
		}

		allResults = append(allResults, results...)
	}
	return allResults, nil
}

func (cdp *CDP) SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	return cdp.SmartParse(f, parsers...)
}

func (cdp *CDP) SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if len(parsers) == 0 {
		parsers = cdp.defaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return nil, errNoParser
	}

	output, err := parser.Parse(input)
	if err != nil {
		return nil, err
	}
	return output, nil
}

func SmartParseFiles(files []string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFiles(files, parsers...)
}

func SmartParseFile(file string, parsers ...Parser) (CDResults, error) {
	return c.SmartParseFile(file, parsers...)
}

func SmartParse(reader io.Reader, parsers ...Parser) (CDResults, error) {
	return c.SmartParse(reader, parsers...)
}

func (cdp *CDP) SmartTrimFiles(files []string, opts []TrimOption, parsers ...Parser) error {
	for _, file := range files {
		err := cdp.SmartTrimFile(file, opts, parsers...)
		if err != nil {
			if err == errNoParser {
				if cdp.failNoParserErr {
					return fmt.Errorf("no trimmer found for file '%s'", file)
				}
				continue
			}
			return err
		}
	}
	return nil
}

func (cdp *CDP) SmartTrimFile(file string, opts []TrimOption, parsers ...Parser) error {
	f, err := os.Open(file)
	if err != nil {
		return err
	}

	output, err := cdp.SmartTrim(f, opts, parsers...)
	if err != nil {
		return err
	}

	err = f.Close()
	if err != nil {
		return err
	}

	return os.WriteFile(file, []byte(output), 0644)
}

func (cdp *CDP) SmartTrim(reader io.Reader, opts []TrimOption, parsers ...Parser) (string, error) {
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}

	if len(parsers) == 0 {
		parsers = cdp.defaultParsers
	}

	input := string(bytes)
	var parser Parser
	for _, p := range parsers {
		if p.CanTransform() && p.CanParse(input) {
			parser = p
			break
		}
	}

	if parser == nil {
		return "", errNoParser
	}

	results, err := parser.Parse(input)
	if err != nil {
		return "", err
	}

	options := &TrimOptions{
		filters:  make([]func(CDResult) bool, 0),
		codes:    make(map[int]bool),
		sizes:    make(map[int]bool),
		types:    make(map[string]bool),
		operator: OrOperator,
	}

	for _, o := range opts {
		o(options)
	}

	stats := make(map[int]*StatusStats)

	var processed []CDResult
	for _, result := range results {
		result.isFiltered = false
		if options.operator == AndOperator {
			result.isFiltered = true
		}

		for _, filter := range options.filters {
			if filter(result) {
				if options.operator == OrOperator {
					result.isFiltered = true
					break
				}
			} else if options.operator == AndOperator {
				result.isFiltered = false
				break
			}
		}

		stat := stats[result.Status]
		if stat == nil {
			stat = &StatusStats{
				TypeCounts: make(map[string]int),
				SizeCounts: make(map[int]int),
			}
			stats[result.Status] = stat
		}

		stat.Count += 1
		stat.SizeCounts[result.ContentLength] += 1
		stat.TypeCounts[result.ContentType] += 1

		processed = append(processed, result)

		// If we are and'ing, only enforce keep max on results that have matched so far
		// If we are or'ing, enforce keep max on everything
		// if options.keepMax > 0 && ((result.isFiltered && options.operator == AndOperator) ||
		// 	(!result.isFiltered && options.operator == OrOperator)) {
		// 	result.isFiltered = statusCounts[result.Status] >= options.keepMax
		// }

		// statusCounts[result.Status] += 1
		// byCode[result.Status] = append(byCode[result.Status], result.source)

		// if !isFiltered && options.keepMax > 0 {
		// 	isFiltered = statusCounts[result.Status] >= options.keepMax
		// }

		// if !isFiltered {
		// 	statusCounts[result.Status] += 1
		// 	filteredByCode[result.Status] = append(filteredByCode[result.Status], result.source)
		// }
	}

	statusEnabled := len(options.codes) > 0
	typeEnabled := len(options.types) > 0
	sizeEnabled := len(options.sizes) > 0

	var notFiltered []interface{}
	for _, result := range processed {
		if options.filterMax > 0 {
			stat := stats[result.Status]

			isStatusMaxed := stat.Count >= options.filterMax
			isTypeMaxed := stat.TypeCounts[result.ContentType] >= options.filterMax
			isSizeMaxed := stat.SizeCounts[result.ContentLength] >= options.filterMax
			if result.isFiltered && options.operator == AndOperator {
				if (statusEnabled && typeEnabled && !sizeEnabled) ||
					(typeEnabled && !sizeEnabled) {
					result.isFiltered = isTypeMaxed
				} else if (statusEnabled && sizeEnabled && !typeEnabled) ||
					(sizeEnabled && !typeEnabled) {
					result.isFiltered = isSizeMaxed
				} else {
					result.isFiltered = isStatusMaxed
				}
			} else if !result.isFiltered && options.operator == OrOperator {
				result.isFiltered = isStatusMaxed
			}
		}

		if result.isFiltered {
			continue
		}

		notFiltered = append(notFiltered, result.source)
	}

	output, err := parser.Transform(input, notFiltered)
	if err != nil {
		return "", err
	}
	return output, nil
}

func SmartTrimFiles(files []string, opts []TrimOption, parsers ...Parser) error {
	return c.SmartTrimFiles(files, opts, parsers...)
}

func SmartTrimFile(file string, opts []TrimOption, parsers ...Parser) error {
	return c.SmartTrimFile(file, opts, parsers...)
}

func SmartTrim(reader io.Reader, opts []TrimOption, parsers ...Parser) (string, error) {
	return c.SmartTrim(reader, opts, parsers...)
}

func init() {
	c = New()
}
