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
		results, err := cdp.SmartParseFile(file)
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

func init() {
	c = New()
}
